class EventEmitter:
    """
    Simple implementation of an event emitter pattern similar to Node.js EventEmitter
    with support for async listeners
    """
    
    def __init__(self):
        """Initialize with an empty dictionary of event listeners"""
        self._events = {}
        # Create a dedicated event loop for this emitter
        import asyncio
        self._loop = None
        try:
            self._loop = asyncio.new_event_loop()
        except:
            pass
        
    def on(self, event_name, listener):
        """Register an event listener"""
        if event_name not in self._events:
            self._events[event_name] = []
        self._events[event_name].append(listener)
        
    def emit(self, event_name, *args):
        """Emit an event with arguments to all registered listeners"""
        if event_name in self._events:
            for listener in self._events[event_name]:
                # Check if the listener is a coroutine function
                import inspect
                if inspect.iscoroutinefunction(listener):
                    # Handle async listener
                    import asyncio
                    import threading
                    import logging
                    logger = logging.getLogger("uvicorn.error")
                    
                    # Try different approaches to run the async function
                    try:
                        # First try: use the current event loop if available
                        loop = asyncio.get_event_loop()
                        if loop.is_running():
                            loop.create_task(listener(*args))
                            continue
                    except RuntimeError:
                        # No running event loop in this thread
                        pass
                    
                    # Second try: use our dedicated event loop if available
                    if self._loop:
                        try:
                            if not self._loop.is_running():
                                # Run the coroutine in our loop
                                self._loop.run_until_complete(listener(*args))
                                continue
                        except:
                            # Something went wrong with our loop
                            pass
                    
                    # Final approach: run in a separate thread
                    # This ensures the async function will be executed even without an event loop
                    def run_async_in_thread():
                        try:
                            # Create a new event loop for this thread
                            thread_loop = asyncio.new_event_loop()
                            asyncio.set_event_loop(thread_loop)
                            # Run the coroutine in this thread's event loop
                            thread_loop.run_until_complete(listener(*args))
                            thread_loop.close()
                        except Exception as e:
                            logger.error(f"Error executing async listener for event '{event_name}': {str(e)}")
                    
                    # Start the thread
                    thread = threading.Thread(target=run_async_in_thread)
                    thread.daemon = True
                    thread.start()
                else:
                    # Regular function, just call it
                    listener(*args)
    
    def __del__(self):
        """Clean up the event loop when the emitter is garbage collected"""
        if self._loop and not self._loop.is_closed():
            try:
                self._loop.close()
            except:
                pass
