class EventEmitter:
    """
    Simple implementation of an event emitter pattern similar to Node.js EventEmitter
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
                listener(*args)
