use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub yaml_meta: String,
    pub file_path: String,
    pub category_id: String,
    pub created_at: String,
    pub updated_at: String,
    pub version: i32,
    pub checksum: String,
    pub category: Option<Category>,
    pub tags: Option<Vec<Tag>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub path: String,
    pub children: Option<Vec<Category>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub children: Option<Vec<Tag>>,
} 