package backend

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	sysruntime "runtime"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type FileCopier struct {
	ctx context.Context
}

type CopyOptions struct {
	SourceDir      string   `json:"sourceDir"`
	TargetDir      string   `json:"targetDir"`
	FileExtensions []string `json:"fileExtensions"`

	// 是否创建日期目录 (默认根据当前月份创建目录)
	CreateDateBasedDir bool `json:"createDateBasedDir"`
	// 基于当前日期或文件修改日期
	UseFileDate bool `json:"useFileDate"`

	// 是否基于格式创建子目录 (默认根据格式创建子目录)
	GroupByFormat bool `json:"groupByFormat"`
	// 日期粒度 (默认月)
	DateGranularity string `json:"dateGranularity"`

	// 是否覆盖目标文件 (默认覆盖)
	Overwrite bool `json:"overwrite"`
	// 是否为测试模式
	DryRun bool `json:"dryRun"`

	// 最大深度 (默认5层)
	MaxDepth int `json:"maxDepth"`

	// 是否拷贝元数据 (默认拷贝)
	CopyMetadata bool `json:"copyMetadata"`

	// 生成图片hash值
	GenerateHash bool `json:"generateHash"`

	// 扫描选项
	IgnoreHidden bool `json:"ignoreHidden"`
	Recursive    bool `json:"recursive"`
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

// 检查文件是否为图片
func (f *FileCopier) isImageFile(ext string, supportedExts map[string]struct{}) bool {
	ext = strings.ToLower(filepath.Ext(ext))
	_, exists := supportedExts[ext]
	return exists
}

type ScanOptions struct {
	SourceDir      string   `json:"sourceDir"`
	FileExtensions []string `json:"fileExtensions"`
	// 忽略隐藏文件和文件夹
	IgnoreHidden bool `json:"ignoreHidden"`
	// 是否递归扫描子目录
	Recursive bool `json:"recursive"`
}

// 扫描目录中的特定的文件
func (f *FileCopier) ScanImageFiles(options *ScanOptions) ([]string, error) {
	var imageFiles []string

	// 将后缀表转为 map 提升性能
	supportedExts := make(map[string]struct{}, len(options.FileExtensions))
	for _, ext := range options.FileExtensions {
		if !strings.HasPrefix(ext, ".") {
			ext = "." + ext
		}
		supportedExts[strings.ToLower(ext)] = struct{}{}
	}

	err := filepath.Walk(options.SourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		name := info.Name()

		// 忽略隐藏文件/文件夹
		if options.IgnoreHidden && strings.HasPrefix(name, ".") {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		// 如果不递归则跳过目录
		if info.IsDir() && !options.Recursive && path != options.SourceDir {
			return filepath.SkipDir
		}

		// 文件判断
		if !info.IsDir() && f.isImageFile(path, supportedExts) {
			imageFiles = append(imageFiles, path)
		}

		return nil
	})

	return imageFiles, err
}

// 拷贝文件
func (f *FileCopier) copyFile(src, dst string, options *CopyOptions) error {
	if options.DryRun {
		fmt.Printf("拷贝文件: %s -> %s\n", src, dst)
		return nil
	}

	if !options.Overwrite {
		if _, err := os.Stat(dst); err == nil {
			return fmt.Errorf("目标文件已存在")
		}
	}

	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}

	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}

	if _, err := io.Copy(dstFile, sourceFile); err != nil {
		return err
	}

	if options.CopyMetadata {
		info, err := os.Stat(src)
		if err == nil {
			_ = os.Chtimes(dst, info.ModTime(), info.ModTime())
		}
	}

	return nil
}

func (f *FileCopier) calcTargetPath(src string, options *CopyOptions) (string, error) {
	ext := filepath.Ext(src)
	base := filepath.Base(src)

	subDir := ""

	// 如果 CreateDateBasedDir 为 true, 则根据 DateGranularity 创建子目录
	if options.CreateDateBasedDir {
		date := time.Now()
		if options.UseFileDate {
			info, err := os.Stat(src)
			if err == nil {
				date = info.ModTime()
			}
		}

		switch options.DateGranularity {
		case "year":
			subDir = date.Format("2006")
		case "month":
			subDir = date.Format("2006-01")
		}
	}

	// 如果 GroupByFormat 为 true, 则根据文件扩展名创建子目录
	if options.GroupByFormat {
		subDir = filepath.Join(subDir, strings.TrimPrefix(ext, "."))
	}

	dst := filepath.Join(options.TargetDir, subDir, base)

	return dst, nil
}

type CopyFileTask struct {
	SrcFile string
	DstFile string
}

// 执行照片拷贝
// 添加拷贝文件缓存, 实现前端进度条
func (f *FileCopier) CopyPhotos(options *CopyOptions) error {
	// 扫描源目录中的图片文件
	imageFiles, err := f.ScanImageFiles(&ScanOptions{
		SourceDir:      options.SourceDir,
		FileExtensions: options.FileExtensions,
		IgnoreHidden:   options.IgnoreHidden,
		Recursive:      options.Recursive,
	})
	if err != nil {
		return fmt.Errorf("扫描目录失败: %v", err)
	}

	total := len(imageFiles)
	if total == 0 {
		return fmt.Errorf("未找到符合条件的图片文件")
	}

	tasks := make(chan CopyFileTask, total)
	status := make(chan string)

	// worker
	workerCount := sysruntime.NumCPU()
	var wg sync.WaitGroup
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for task := range tasks {
				if err := f.copyFile(task.SrcFile, task.DstFile, options); err != nil {
					status <- fmt.Sprintf("拷贝失败 %s: %v", filepath.Base(task.SrcFile), err)
				} else {
					status <- fmt.Sprintf("拷贝成功 %s", filepath.Base(task.SrcFile))
				}
			}
		}()
	}

	// 启动任务
	go func() {
		completed := 0
		for msg := range status {
			completed++
			progress := map[string]interface{}{
				"total":     total,
				"completed": completed,
				"message":   msg,
			}
			runtime.EventsEmit(f.ctx, "copy:progress", progress)
		}
	}()

	// 构造任务
	for _, src := range imageFiles {
		dst, err := f.calcTargetPath(src, options)
		if err != nil {
			status <- fmt.Sprintf("拷贝失败 %s: %v", filepath.Base(src), err)
			continue
		}
		tasks <- CopyFileTask{
			SrcFile: src,
			DstFile: dst,
		}
	}

	close(tasks)
	wg.Wait()
	close(status)

	runtime.EventsEmit(f.ctx, "copy:progress", map[string]interface{}{
		"total":     total,
		"completed": total,
		"message":   "完成",
	})

	return nil
}
