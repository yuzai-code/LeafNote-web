// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
use models::{Category, Note};

#[tauri::command]
async fn get_categories() -> Result<Vec<Category>, String> {
    // 创建自定义客户端配置
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)  // 开发环境可以接受无效证书
        .no_proxy()  // 禁用系统代理
        .build()
        .map_err(|e| e.to_string())?;
    
    
    let url = "http://127.0.0.1:8080/api/v1/categories";  // 使用 127.0.0.1 替代 localhost
    
    let response = client
        .get(url)
        .header("User-Agent", "Tauri/1.0")
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| {
            println!("Error sending request: {}", e);
            e.to_string()
        })?;
    
/*     println!("Response status: {}", response.status());
    println!("Response headers: {:#?}", response.headers()) */;
    
    // 获取响应体的文本内容
    let text = response.text().await.map_err(|e| {
        println!("Error reading response text: {}", e);
        e.to_string()
    })?;
    
    // println!("Response body: {}", text);
    
    // 尝试解析 JSON
    let categories: Vec<Category> = serde_json::from_str(&text).map_err(|e| {
        println!("Error parsing JSON: {}", e);
        e.to_string()
    })?;
    
    // println!("Successfully parsed {} categories", categories.len());
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
