package backend

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type FileCopier struct {
	ctx context.Context
}

type CopyOptions struct {
	SourceDir         string   `json:"sourceDir"`
	TargetDir         string   `json:"targetDir"`
	FileExtensions    []string `json:"fileExtensions"`
	MaxFileSize       int64    `json:"maxFileSize"` // 字节
	MaxFileCount      int      `json:"maxFileCount"`
	PreserveStructure bool     `json:"preserveStructure"`
}

type CopyProgress struct {
	CurrentFile    string  `json:"currentFile"`
	ProcessedCount int     `json:"processedCount"`
	TotalCount     int     `json:"totalCount"`
	Progress       float64 `json:"progress"`
	Status         string  `json:"status"`
}

type CopyResult struct {
	SuccessCount int      `json:"successCount"`
	ErrorCount   int      `json:"errorCount"`
	Errors       []string `json:"errors"`
	TotalSize    int64    `json:"totalSize"`
}

func NewFileCopier() *FileCopier {
	return &FileCopier{}
}

func (f *FileCopier) OnStartup(ctx context.Context) {
	f.ctx = ctx
}

func (f *FileCopier) SelectDir() string {
	dir, err := runtime.OpenDirectoryDialog(f.ctx, runtime.OpenDialogOptions{
		Title:                "请选择一个目录",
		CanCreateDirectories: true,
		DefaultDirectory:     "",
	})

	if err != nil {
		return fmt.Sprintf("Error: %v", err)
	}

	return dir
}

// 获取支持的图片文件扩展名
func (f *FileCopier) GetSupportedExtensions() []string {
	return []string{
		".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif",
		".webp", ".svg", ".ico", ".heic", ".heif", ".raw", ".cr2",
		".nef", ".arw", ".dng", ".orf", ".rw2",
	}
}

// 检查文件是否为图片
func (f *FileCopier) isImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	supportedExts := f.GetSupportedExtensions()

	for _, supportedExt := range supportedExts {
		if ext == supportedExt {
			return true
		}
	}
	return false
}

// 扫描目录中的图片文件
func (f *FileCopier) ScanImageFiles(sourceDir string) ([]string, error) {
	var imageFiles []string

	err := filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && f.isImageFile(path) {
			imageFiles = append(imageFiles, path)
		}

		return nil
	})

	return imageFiles, err
}

// 拷贝文件
func (f *FileCopier) copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	// 确保目标目录存在
	dstDir := filepath.Dir(dst)
	if err := os.MkdirAll(dstDir, 0755); err != nil {
		return err
	}

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

// 执行照片拷贝
func (f *FileCopier) CopyPhotos(options CopyOptions) CopyResult {
	result := CopyResult{}

	// 扫描源目录中的图片文件
	imageFiles, err := f.ScanImageFiles(options.SourceDir)
	if err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("扫描目录失败: %v", err))
		return result
	}

	// 应用文件扩展名过滤
	if len(options.FileExtensions) > 0 {
		filteredFiles := []string{}
		for _, file := range imageFiles {
			ext := strings.ToLower(filepath.Ext(file))
			for _, allowedExt := range options.FileExtensions {
				if ext == allowedExt {
					filteredFiles = append(filteredFiles, file)
					break
				}
			}
		}
		imageFiles = filteredFiles
	}

	// 应用文件大小限制
	if options.MaxFileSize > 0 {
		filteredFiles := []string{}
		for _, file := range imageFiles {
			if info, err := os.Stat(file); err == nil && info.Size() <= options.MaxFileSize {
				filteredFiles = append(filteredFiles, file)
			}
		}
		imageFiles = filteredFiles
	}

	// 应用文件数量限制
	if options.MaxFileCount > 0 && len(imageFiles) > options.MaxFileCount {
		imageFiles = imageFiles[:options.MaxFileCount]
	}

	totalCount := len(imageFiles)

	for i, srcFile := range imageFiles {
		// 计算目标路径
		var dstFile string
		if options.PreserveStructure {
			// 保持目录结构
			relPath, _ := filepath.Rel(options.SourceDir, srcFile)
			dstFile = filepath.Join(options.TargetDir, relPath)
		} else {
			// 直接拷贝到目标目录
			filename := filepath.Base(srcFile)
			dstFile = filepath.Join(options.TargetDir, filename)
		}

		// 发送进度更新
		progress := CopyProgress{
			CurrentFile:    filepath.Base(srcFile),
			ProcessedCount: i + 1,
			TotalCount:     totalCount,
			Progress:       float64(i+1) / float64(totalCount) * 100,
			Status:         "拷贝中...",
		}
		runtime.EventsEmit(f.ctx, "copy-progress", progress)

		// 执行拷贝
		if err := f.copyFile(srcFile, dstFile); err != nil {
			result.ErrorCount++
			result.Errors = append(result.Errors, fmt.Sprintf("拷贝失败 %s: %v", filepath.Base(srcFile), err))
		} else {
			result.SuccessCount++
			if info, err := os.Stat(srcFile); err == nil {
				result.TotalSize += info.Size()
			}
		}

		// 添加小延迟避免UI阻塞
		time.Sleep(10 * time.Millisecond)
	}

	// 发送完成进度
	runtime.EventsEmit(f.ctx, "copy-progress", CopyProgress{
		CurrentFile:    "",
		ProcessedCount: totalCount,
		TotalCount:     totalCount,
		Progress:       100,
		Status:         "完成",
	})

	return result
}
