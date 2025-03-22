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
                        asyncio.create_task(listener(*args))
                    except RuntimeError:
                        # If we're not in an event loop, just call the function without awaiting
                        # This is not ideal but prevents errors when called outside an async context
                        asyncio.run(listener(*args))
                else:
                    # Regular function, just call it
                    listener(*args)
