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

    stage('Build Image') {
        (image, imageName) = buildDockerImage('climate-explorer-frontend')
    }

    stage('Publish Image') {
        publishDockerImage(image, 'PCIC_DOCKERHUB_CREDS')
    }

    if(BRANCH_NAME.contains('PR')) {
        stage('Security Scan') {
            writeFile file: 'anchore_images', text: imageName
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
