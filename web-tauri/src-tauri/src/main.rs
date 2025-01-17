// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
async fn get_categories() -> Result<Vec<Category>, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("http://localhost:8080/api/v1/categories")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let categories = response
        .json::<Vec<Category>>()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(categories)
}

#[tauri::command]
async fn get_notes() -> Result<Vec<Note>, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("http://localhost:8080/api/v1/notes")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let notes = response
        .json::<Vec<Note>>()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(notes)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_categories, get_notes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
