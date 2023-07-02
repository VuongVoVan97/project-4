import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {createLogger} from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const S3_BUCKET = process.env.ATTACHMENT_S3_BUCKET
const AWS_REGION = process.env.AWS_REGION
const logger = createLogger('AttachmentUtils')
const S3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export async function createPresignedUrl(attachmentId: string): Promise<string> {
    logger.info(`Get S3 SignedUrl with attachmentId: ${attachmentId}`)
    let presignedUrl = S3.getSignedUrl('putObject', {
        Bucket: S3_BUCKET,
        Key: attachmentId,
        Expires: 60
    })
    return presignedUrl
}

export async function getUploadUrl(attachmentId: string): Promise<string>  {
    return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${attachmentId}`
}