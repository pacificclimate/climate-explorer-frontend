@Library('pcic-pipeline-library')_


node {
    stage('Code Collection') {
        collectCode()
    }

    stage('Node Test Suite') {
        runNodeTestSuite('node', 'jenkins-test')
    }

    def image
    def imageName
    def imageSuffix = 'climate-explorer-frontend'

    stage('Build Image') {
        (image, imageName) = buildDockerImage(imageSuffix)
    }

    stage('Publish Image') {
        publishDockerImage(image, 'PCIC_DOCKERHUB_CREDS')
    }

    if(BRANCH_NAME.contains('PR') || BRANCH_NAME == 'master') {
        stage('Security Scan') {
            writeFile file: 'anchore_images', text: getScanName(imageSuffix)
            anchore name: 'anchore_images', engineRetries: '700'
        }
    }

    stage('Clean Local Image') {
        removeDockerImage(imageName)
    }

    stage('Clean Workspace') {
        cleanWs()
    }
}
