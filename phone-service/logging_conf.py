import logging
import sys

def configure_logging():
    """Configure logging for the phone service"""
    # Get the root logger
    logger = logging.getLogger("uvicorn.error")
    
    # Set the logging level
    logger.setLevel(logging.INFO)
    
    # Create a handler that writes to stderr
    handler = logging.StreamHandler(sys.stderr)
    handler.setLevel(logging.INFO)
    
    # Create a formatter and add it to the handler
    formatter = logging.Formatter('%(levelname)s: %(message)s')
    handler.setFormatter(formatter)
    
    # Add the handler to the logger
    logger.addHandler(handler)
    
    # Prevent log messages from being duplicated
    logger.propagate = False
    
    return logger
