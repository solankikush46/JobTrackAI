from PIL import Image
import sys

def remove_black_background(input_path, output_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check if pixel is black (or very close to it)
            if item[0] < 10 and item[1] < 10 and item[2] < 10:
                newData.append((0, 0, 0, 0))  # Make it transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully saved transparent image to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = r"c:\Users\solan\Desktop\JobTrackAI\src\frontend\src\assets\logo_icon.png"
    output_file = r"c:\Users\solan\Desktop\JobTrackAI\src\frontend\src\assets\logo_icon_transparent.png"
    remove_black_background(input_file, output_file)
