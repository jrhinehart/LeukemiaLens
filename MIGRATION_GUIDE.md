# Migration Guide: Moving LeukemiaLens to a Permanent Workspace

The project is currently located in a temporary playground directory. Follow these steps to move it to a permanent location (e.g., your Documents or Projects folder).

## 1. Move the Folder
1.  Close Visual Studio Code.
2.  Locate the folder: `c:\Users\jrrhi\.gemini\antigravity\playground\prismic-triangulum`
3.  Cut and Paste this folder to your desired location (e.g., `C:\Users\jrrhi\Documents\Projects\`).
4.  (Optional) Rename the folder from `prismic-triangulum` to `LeukemiaLens`.

## 2. Open in VS Code
1.  Open VS Code.
2.  Go to **File > Open Folder...** and select your new `LeukemiaLens` folder.
3.  (Optional) Save the workspace by going to **File > Save Workspace As...** if you want to configure specific workspace settings.

## 3. Re-create the Partial Python Environment
*Note: Python virtual environments (`venv`) often contain absolute file paths and may break when moved.*

To fix this, delete the old `venv` and create a new one:

1.  **Delete** the `backend/venv` folder.
2.  Open a terminal in the `backend` folder and run:
    ```bash
    python -m venv venv
    ```
3.  Activate it:
    ```bash
    # Windows
    venv\Scripts\activate
    ```
4.  Re-install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## 4. Run the Application
You can now run the app as usual:

**Backend:**
```bash
# In backend/
venv\Scripts\python main.py
```

**Frontend:**
```bash
# In frontend/
npm run dev
```
