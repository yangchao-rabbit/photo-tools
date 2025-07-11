package main

import (
	"context"
	"embed"
	"photo-copier/backend"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	fc := backend.NewFileCopier()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "photo-copier",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			fc.OnStartup(ctx)
		},
		Bind: []interface{}{
			app,
			fc,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
