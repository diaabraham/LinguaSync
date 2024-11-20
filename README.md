## **LinguaSync - An Automated CMS Language Translation tool**  

### **Overview**  
This repository contains a robust solution to automate the localization of websites for French, built to improve upon default translation tools like DeepL. The tool ensures precise translations while handling critical tasks like link replacement, image localization, and integration with HubSpot CMS.  

### **Why This Project?**  
The default DeepL AI translations often miss essential elements such as:  
- Correctly replacing links with their second-language equivalents.  
- Localizing images to match regional preferences.  

This tool addresses these gaps, offering a seamless, scalable, and customizable solution for multilingual content management.  

---

## **Features**  
### **1. Automatic Link Replacement**  
- Uses a **link replacement database** to map English links to second-language equivalents.  
- Configurable and easily maintainable through a centralized database.  

### **2. Image Localization**  
- Supports automatic replacement of English images with localized versions.  
- Uses an **image mapping system** to track regional preferences.  
- Automatically generates AI-based localized images when replacements are unavailable, with notifications for manual review.  

### **3. HubSpot CMS Integration**  
- Leverages the HubSpot API to automate translation workflows.  
- Minimal manual intervention with configurable matching rules.  
- Logs all actions for traceability and review.  

---

## **Installation**  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/diaabraham/LinguaSync.git 
   cd LinguaSync  
   ```  
2. Install dependencies:  
   ```bash  
   pip install -r requirements.txt  
   ```  
3. Configure the `config.json` file:  
   - Add your HubSpot or other CMS API key.  
   - Define paths for link and image replacement databases.
4. Run `npm start` to start the automation process (no-gui).


---

## **Usage with GUI**  
To start using the automation tool:
1. Run the backend API: `npm run start:api`
2. In a separate terminal, run the React frontend: `npm run start:ui`
3. Access the user interface in your browser (typically at `http://localhost:3000`)
4. Use the UI to manage mappings and trigger the automation process

## **NO-GUI usage**
For automated runs without the UI:
1. Update the `src/main.ts` file to include any specific logic you need
2. Run the automation: `npm start`  
3. Update databases as needed to add new links or image mappings.  

---

## **Roadmap**  
1. Enhanced AI for contextual French translation.  
2. Advanced analytics for localization improvements.  
3. Improved UI for manual review and database management.  

---

## **Contributing**  
Feel free to fork the project, submit issues, or create pull requests. Contributions are welcome!  

---
