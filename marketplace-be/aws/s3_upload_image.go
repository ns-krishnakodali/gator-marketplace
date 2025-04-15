package aws

import (
	"context"
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// UploadImages uploads multiple image files to S3 and returns their public URLs
func UploadImages(files []*multipart.FileHeader, filePrefix string, fileParent string) ([]string, []error) {
	var wg sync.WaitGroup
	urls := make([]string, len(files))
	errs := make([]error, len(files))

	ctx := context.Background()

	for idx, file := range files {
		wg.Add(1)

		go func(idx int, file *multipart.FileHeader) {
			defer wg.Done()

			uploadCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
			defer cancel()

			fileObj, err := file.Open()
			if err != nil {
				errs[idx] = fmt.Errorf("failed to open file: %v", err)
				return
			}
			defer fileObj.Close()

			buffer := make([]byte, 512)
			_, err = fileObj.Read(buffer)
			if err != nil {
				errs[idx] = fmt.Errorf("failed to read file header: %v", err)
				return
			}
			contentType := http.DetectContentType(buffer)

			// Reset file pointer to beginning
			_, err = fileObj.Seek(0, 0)
			if err != nil {
				errs[idx] = fmt.Errorf("failed to reset file pointer: %v", err)
				return
			}

			s3Key := fmt.Sprintf("%s/%s/%d-%d%s", filePrefix, fileParent, time.Now().Unix(), idx, filepath.Ext(file.Filename))

			_, err = S3Client.PutObject(uploadCtx, &s3.PutObjectInput{
				Bucket:      &BucketName,
				Key:         &s3Key,
				Body:        fileObj,
				ContentType: &contentType,
				ACL:         types.ObjectCannedACLPublicRead, // Keep this for public access
			})
			if err != nil {
				errs[idx] = fmt.Errorf("failed to upload to S3: %v", err)
				return
			}

			urls[idx] = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", BucketName, Region, s3Key)
		}(idx, file)
	}

	wg.Wait()

	// Filter out nil errors
	var actualErrs []error
	for _, err := range errs {
		if err != nil {
			actualErrs = append(actualErrs, err)
		}
	}

	return urls, actualErrs
}
