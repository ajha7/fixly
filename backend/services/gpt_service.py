import openai
import os
from termcolor import colored
import asyncio
from typing import List, Dict, Any, Optional
from events import EventEmitter

class GptService(EventEmitter):
    """Handles interaction with OpenAI's GPT models for conversation"""
    
    def __init__(self):
        """Initialize the GPT service with conversation context"""
        super().__init__()
        self.openai = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.user_context = [
            # Initial instructions and info for the AI
            {"role": "system", "content": """You are a helpful assistant for a client looking for help with their plumbing needs. 
              Keep your inquiries and responses friendly. Don't ask more than 1 question at a time. 
              Ask about whether the contractor does the job you need help with.
              If the contractor does not do the job you need help with, say thank you and end the call.
              If the contractor does the job you need help with, ask about the availability of the contractor.
              If the contractor is available, ask about the price of the job.
              If the contractor is not available, say thank you and end the call.
              You must add a '•' symbol every 5 to 10 words at natural pauses where your response can be split for text to speech."""},
            # Welcome message
            {"role": "assistant", "content": "Hi, I am an assistant for a client looking for help with their plumbing needs. Do you have a minute to talk?"},
        ]
        self.partial_response_index = 0  # Tracks pieces of response for order
    
    def set_call_sid(self, call_sid: str) -> None:
        """Store the call's unique ID"""
        self.user_context.append({"role": "system", "content": f"callSid: {call_sid}"})
    
    def update_user_context(self, name: str, role: str, text: str) -> None:
        """Add new messages to conversation history"""
        if name != 'user':
            self.user_context.append({"role": role, "name": name, "content": text})
        else:
            self.user_context.append({"role": role, "content": text})
    
    async def completion(self, text: str, interaction_count: int, role: str = 'user', name: str = 'user') -> None:
        """Main function that handles getting responses from GPT"""
        # Add user's message to conversation history
        self.update_user_context(name, role, text)
        
        # Get streaming response from GPT
        stream = await self.openai.chat.completions.create(
            model='gpt-4o-mini',
            messages=self.user_context,
            stream=True,
        )
        
        # Track both complete response and chunks for speaking
        complete_response = ''
        partial_response = ''
        
        # Process each piece of GPT's response as it comes
        async for chunk in stream:
            content = chunk.choices[0].delta.content or ''
            finish_reason = chunk.choices[0].finish_reason
            
            complete_response += content
            partial_response += content
            
            # When we hit a pause marker (•) or the end, send that chunk for speech
            if content.strip() and content.strip()[-1] == '•' or finish_reason == 'stop':
                gpt_reply = {
                    'partial_response_index': self.partial_response_index,
                    'partial_response': partial_response
                }
                self.emit('gptreply', gpt_reply, interaction_count)
                self.partial_response_index += 1
                partial_response = ''
        
        # Add GPT's complete response to conversation history
        self.user_context.append({'role': 'assistant', 'content': complete_response})
        print(colored(f"GPT -> user context length: {len(self.user_context)}", "green"))
