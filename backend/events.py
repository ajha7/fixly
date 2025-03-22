class EventEmitter:
    """
    Simple implementation of an event emitter pattern similar to Node.js EventEmitter
    with support for async listeners
    """
    
    def __init__(self):
        """Initialize with an empty dictionary of event listeners"""
        self._events = {}
        
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
                    # Create a task to run the coroutine, but don't wait for it
                    import asyncio
                    try:
                        # Try to get the current event loop and create a task
                        loop = asyncio.get_event_loop()
                        if loop.is_running():
                            loop.create_task(listener(*args))
                        else:
                            # If loop exists but isn't running, run the coroutine until complete
                            loop.run_until_complete(listener(*args))
                    except RuntimeError:
                        # If we're not in an event loop context, log a warning
                        # instead of trying to run the coroutine
                        import logging
                        logger = logging.getLogger("uvicorn.error")
                        logger.warning(f"Async listener for event '{event_name}' could not be executed: no running event loop")
                        # Create a non-blocking wrapper for the async function
                        def run_async_in_thread():
                            import asyncio
                            asyncio.run(listener(*args))
                        
                        # Run the wrapper in a separate thread
                        import threading
                        thread = threading.Thread(target=run_async_in_thread)
                        thread.daemon = True  # Allow the thread to be terminated when the main program exits
                        thread.start()
                else:
                    # Regular function, just call it
                    listener(*args)
