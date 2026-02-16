import zipfile
import os

def zip_game():
    zip_filename = 'urban_void_game.zip'
    files_to_zip = [
        'index.html',
        'manifest.json',
        'icon-192.png',
        'icon-512.png'
    ]
    dirs_to_zip = [
        'css',
        'js'
    ]

    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in files_to_zip:
            if os.path.exists(file):
                zipf.write(file)
                print(f"Added {file}")
            else:
                print(f"Warning: {file} not found")

        for directory in dirs_to_zip:
            if os.path.exists(directory):
                for root, dirs, files in os.walk(directory):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path)
                        print(f"Added {file_path}")
            else:
                print(f"Warning: {directory} not found")

    print(f"Successfully created {zip_filename}")

if __name__ == "__main__":
    zip_game()
