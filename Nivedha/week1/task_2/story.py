from transformers import pipeline
pipe = pipeline("text-classification", model="tabularisai/multilingual-sentiment-analysis")
from transformers import pipeline, set_seed
generator = pipeline('text-generation', model='gpt2')
import re
set_seed(492)


story_prompt = "I am in front of a haunted castle which is 100 years old,"
print(story_prompt)

def clean_generated_text(text):
    text = ". ".join(text.split(".")[:-1])
    return text

def getTone(label):
    if label.lower() in ["positive", "very positive"]:
        return "happy"
    elif label.lower() in ["negative", "very negative"]:
        return "fearful"
    else:
        return "calm"
    
def get_valid_input(prompt):
    while True:
        user_input = input(prompt).strip()
        if len(user_input.split()) >= 2:
            return user_input
        else:
            print("Please enter at least two words.")


for i in range(3):
    user_input = get_valid_input("What would you do: ")


    sentence = user_input
    result = pipe(sentence)
    tone = getTone(result[0]['label'])

    print(f"User Story line: {user_input} \nStory tone : {tone}\nConfidence score: {result[0]['score']}")
    story_prompt = generator(story_prompt+user_input+f" and now I feel {tone}", max_new_tokens=30, num_return_sequences=1,eos_token_id=50256,)[0]['generated_text']
    story_prompt = clean_generated_text(story_prompt)
    print(story_prompt)
