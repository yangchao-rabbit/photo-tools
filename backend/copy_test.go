package backend

import (
	"fmt"
	"testing"
)

func TestScanImageFiles(t *testing.T) {
	fc := NewFileCopier()
	imageFiles, err := fc.ScanImageFiles(&ScanOptions{
		SourceDir:      "/Volumes/My Book/胶片翻拍/20250426-东极岛黑白翻拍",
		FileExtensions: []string{"jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"},
		IgnoreHidden:   true,
		Recursive:      true,
	})
	if err != nil {
		t.Fatalf("ScanImageFiles failed: %v", err)
	}

	for _, file := range imageFiles {
		fmt.Println(file)
	}

	fmt.Println(len(imageFiles))
}

func TestCalcTargetPath(t *testing.T) {
	fc := NewFileCopier()

	dst, err := fc.calcTargetPath("/Volumes/My Book/胶片翻拍/45大熊猫/DSC00368.ARW", &CopyOptions{
		TargetDir:          "/Volumes/2222",
		CreateDateBasedDir: true,
		DateGranularity:    "month",
		GroupByFormat:      false,
		UseFileDate:        false,
	})
	if err != nil {
		t.Fatalf("calcTargetPath failed: %v", err)
	}

	fmt.Println(dst)
}

func TestCopyPhotos(t *testing.T) {
	fc := NewFileCopier()
	err := fc.CopyPhotos(&CopyOptions{
		SourceDir:          "/Volumes/My Book/胶片翻拍/20250426-东极岛黑白翻拍",
		TargetDir:          "/Volumes/2222",
		FileExtensions:     []string{"jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"},
		IgnoreHidden:       true,
		Recursive:          true,
		CreateDateBasedDir: true,
		DateGranularity:    "month",
		GroupByFormat:      true,
		UseFileDate:        false,
		DryRun:             true,
	})

	if err != nil {
		t.Fatalf("CopyPhotos failed: %v", err)
	}

	fmt.Println("CopyPhotos done")
}
