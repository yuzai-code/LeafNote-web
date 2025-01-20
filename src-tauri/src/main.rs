// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
use models::{Category, Note};

#[tauri::command]
async fn get_categories() -> Result<Vec<Category>, String> {
    let client = reqwest::Client::new();
    println!("Fetching categories from backend...");
    
    let response = client
        .get("http://localhost:8080/api/v1/categories")
        .send()
        .await
        .map_err(|e| {
            println!("Error sending request: {}", e);
            e.to_string()
        })?;
    
    println!("Response status: {}", response.status());
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        println!("Error response: {}", error_text);
        return Err(format!("Backend error: {}", error_text));
    }
    
    let categories = response
        .json::<Vec<Category>>()
        .await
        .map_err(|e| {
            println!("Error parsing response: {}", e);
            e.to_string()
        })?;
    
    println!("Successfully fetched {} categories", categories.len());
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
