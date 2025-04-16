package aws

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var (
	S3Client   *s3.Client
	BucketName string
	Region     string
)

// InitializeS3 sets up the AWS S3 client using env vars
func InitializeS3() {
	Region = os.Getenv("AWS_REGION")
	BucketName = os.Getenv("S3_BUCKET")

	if Region == "" || BucketName == "" {
		fmt.Println("Error: AWS_REGION and S3_BUCKET must be set in the environment")
		return
	}

	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(Region))
	if err != nil {
		fmt.Printf("Error: failed to load AWS config: %v\n", err)
		return
	}

	S3Client = s3.NewFromConfig(cfg)

	fmt.Println("S3 initialized for bucket:", BucketName)
}
