import openai
from termcolor import colored
import asyncio
from typing import List, Dict, Any, Optional
from events import EventEmitter

class GptService(EventEmitter):
    """Handles interaction with OpenAI's GPT models for conversation"""
    
    def __init__(self):
        """Initialize the GPT service with conversation context"""
        super().__init__()
        self.openai = openai.OpenAI()
        self.user_context = [
            # Initial instructions and info for the AI
            {"role": "system", "content": """You are a helpful assistant for Bart's Automotive. 
              Keep your responses brief but friendly. Don't ask more than 1 question at a time. 
              If asked about services not listed below, politely explain we don't offer that service but can refer them to another shop.
              Key Information:
              - Hours: Monday to Friday 9 AM to 5 PM
              - Address: 123 Little Collins Street, Melbourne
              - Services: Car service, brake repairs, transmission work, towing, and general repairs
              You must add a '•' symbol every 5 to 10 words at natural pauses where your response can be split for text to speech."""},
            # Welcome message
            {"role": "assistant", "content": "Welcome to Bart's Automotive. • How can I help you today?"},
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
