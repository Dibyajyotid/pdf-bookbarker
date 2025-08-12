package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

type Bookmark struct {
	URL   string `json:"url"`
	Page  int    `json:"page"`
	Title string `json:"title"`
	Notes string `json:"notes"`
}

var bookmarks []Bookmark

const dataFile = "bookmarks.json"

func init() {
	//load existing bookmarks from file
	loadBookmarks()
}

func loadBookmarks() {
	path := filepath.Join(filepath.Dir(os.Args[0]), dataFile)
	data, err := os.ReadFile(path)
	if err != nil {
		if !os.IsNotExist(err) {
			panic("Failed to read bookmarks file: " + err.Error())
		}
		return // No bookmarks file exists, nothing to load
	}

	if err := json.Unmarshal(data, &bookmarks); err != nil {
		panic("Failed to parse bookmarks file: " + err.Error())
	}
}

func saveBookmarks() {
	data, err := json.MarshalIndent(bookmarks, "", "  ")
	if err != nil {
		panic("Failed to marshal bookmarks: " + err.Error())
	}

	path := filepath.Join(filepath.Dir(os.Args[0]), dataFile)
	if err := os.WriteFile(path, data, 0644); err != nil {
		panic("Failed to write bookmarks file: " + err.Error())
	}
}

func addBookmarkHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var bm Bookmark
	if err := json.NewDecoder(r.Body).Decode(&bm); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	bookmarks = append(bookmarks, bm)
	saveBookmarks()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Bookmark added successfully",
		"url":     bm.URL,
		"status":  "success",
	})
}

func getBookmarksHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookmarks)
}


func main() {
	http.HandleFunc("/add-bookmark", addBookmarkHandler)
	http.HandleFunc("/get-bookmarks", getBookmarksHandler)

	port := ":8080"
	fmt.Println("Server is running on port", port)
    if err := http.ListenAndServe(port, nil); err != nil {
        panic("Failed to start server: " + err.Error())
    }

	os.Exit(0) // Exit gracefully after server shutdown

}