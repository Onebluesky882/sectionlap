package services

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const presignTTL = 1 * time.Hour

type R2Presigner struct {
	client *s3.PresignClient
	bucket string
}

// NewR2Presigner returns nil if any R2 credential is missing — callers must
// treat a nil presigner as "R2 not configured" and skip presigning.
func NewR2Presigner(endpoint, accessKeyID, secretAccessKey, bucket string) *R2Presigner {
	if endpoint == "" || accessKeyID == "" || secretAccessKey == "" || bucket == "" {
		return nil
	}

	cfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion("auto"),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyID, secretAccessKey, "")),
	)
	if err != nil {
		return nil
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	return &R2Presigner{
		client: s3.NewPresignClient(client),
		bucket: bucket,
	}
}

// PresignGetURL returns a time-limited GET URL for the given R2 object key.
func (p *R2Presigner) PresignGetURL(ctx context.Context, key string) (string, error) {
	req, err := p.client.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(p.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(presignTTL))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}
