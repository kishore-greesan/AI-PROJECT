from transformers import pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
from transformers import AutoModelForQuestionAnswering, AutoTokenizer

# model_name = "deepset/roberta-base-squad2"
# nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)
qa_pipeline = pipeline("question-answering")

def get_paragraph_input(prompt="📝 Enter paragraph (type 'END' to finish):"):
    print(prompt)
    lines = []
    while True:
        line = input()
        if line.strip().upper() == "END":
            break
        lines.append(line)
    return " ".join(lines)

def summarize_paragraph(paragraph):
    summary = summarizer(paragraph, max_length=100, min_length=50, do_sample=False)
    return summary[0]['summary_text']

while True:
    paragraph = get_paragraph_input()
    if len(paragraph.strip()) > 1000 or len(paragraph.split(' ')) < 10:
        print("Please enter a valid paragraph, it should be more than 10 words and less than 1000 words")
        continue
    break

print("Summarizing...")
summary = summarize_paragraph(paragraph)
print(f"Summary: {summary}")

while True:
    question = input("Enter a question: ")
    if question.strip().upper() == "END":
        break
    res = qa_pipeline(question, paragraph)
    print(f"Answer: {res['answer']}")






