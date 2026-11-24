import sys
import json
from paddleocr import PaddleOCR

def extract_data_from_image(image_path):
    # Initialize PaddleOCR
    # use_angle_cls=True to automatically detect and rotate skewed text
    # lang='en' handles english text well (can use 'hi' for hindi)
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    
    # Run OCR on the image
    result = ocr.ocr(image_path, cls=True)
    
    extracted_text_blocks = []
    
    if result and result[0]:
        for line in result[0]:
            # Each 'line' contains: [[top-left, top-right, bottom-right, bottom-left], (text, confidence)]
            box = line[0]
            text = line[1][0]
            confidence = line[1][1]
            
            extracted_text_blocks.append({
                "box": box,
                "text": text,
                "confidence": float(confidence)
            })
            
    # Return the data as JSON so the Java backend can read it
    print(json.dumps(extracted_text_blocks))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    image_file = sys.argv[1]
    extract_data_from_image(image_file)
