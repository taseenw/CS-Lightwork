#ChatGPT OpenAi Basics - Python
#Author: Taseen Waseq

import openai

openai.api_key = "Your API Key"

model_engine = "text-davinci-003"

def getAnswer(question):
    completion = openai.Completion.create(
        engine=model_engine,
        prompt=question,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.5,
    )
    response = completion.choices[0].text.strip()
    
    return response

question = input("Ask a question: ")
answer = getAnswer(question)

print("\nAnswer > " + answer)
