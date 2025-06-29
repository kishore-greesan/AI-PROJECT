from transformers import pipeline
from PIL import Image
import os
from sentence_transformers import SentenceTransformer, util

image_to_text = pipeline("image-to-text", model="nlpconnect/vit-gpt2-image-captioning")
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

SUPPORTED_FORMATS = (".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tiff", ".webp")


def get_images_from_assets(folder_path="assets"):
    # Ensure folder exists
    if not os.path.isdir(folder_path):
        raise FileNotFoundError(f"Folder not found: {folder_path}")
    
    # Get image file paths
    image_paths = [
        os.path.join(folder_path, filename)
        for filename in os.listdir(folder_path)
        if filename.lower().endswith(SUPPORTED_FORMATS)
    ]
    return image_paths

image_files = get_images_from_assets()
image_descriptions = []


for image_file in image_files:
    image = Image.open(image_file).convert("RGB") 
    caption = image_to_text(image)
    caption_text = caption[0]['generated_text']
    caption_embedding = model.encode(caption_text, convert_to_tensor=True)
    image_descriptions.append({"image_file": image_file, "caption": caption_text, "caption_embedding": caption_embedding})
    print(f"{image_file} - {caption_text}")


while True:
    user_input = input("Enter a search term: ")
    if user_input.lower() == "exit":
        print("👋 Exiting.")
        break
    
    input_embedding = model.encode(user_input, convert_to_tensor=True)
    
    for image_description in image_descriptions:
        similarity = util.pytorch_cos_sim(input_embedding, image_description["caption_embedding"])
        if similarity.item() > 0.4:
            print(f"Similarity: {similarity.item():.4f} {image_description['image_file']}")



# NOTES:
# How it works as per my analysis:
# 1. The model that we are using for image to text is nlpconnect/vit-gpt2-image-captioning.
#    - how it works:
#      - it is a transformer model that is trained on a dataset of images and their descriptions.
#      - first the transformer to encode and decode is mentioned in the model name.
#      - model is moved to the GPU/CPU.
#      - Then the image to process, is pre processed and then passed to the transformer.
#      - It Converts the image into a tensor[tensor is just a multidimensional array] that matches what the ViT encoder expects.
#      - Moves the tensor (pixel_values) to the device you're using (CPU or GPU)
#        - This is required because the model itself was moved to that device.
#      - now, model generates the tensor of the output with input tensor and some params like max length, temperature, etc.
#      - the tokenizer is used to convert the output tensor into a string.

# STEP 2: the output text is encoded using the sentence transformer model 'multi-qa-MiniLM-L6-cos-v1'.
# STEP 3: the encoded text is compared with the image descriptions using the cosine similarity.






