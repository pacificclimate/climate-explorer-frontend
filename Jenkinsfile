@Library('pcic-pipeline-library')_


node {
    stage('Code Collection') {
        collectCode()
    }

    stage('Node Test Suite') {
        runNodeTestSuite('node', 'jenkins-test')
    }

    def image
    def imageName = buildImageName('climate-explorer-frontend')

    stage('Build Image') {
        def commitish = sh(returnStdout: true, script: './generate-commitish.sh').trim()
        def options = [buildArgs: "--pull --build-arg REACT_APP_CE_CURRENT_VERSION='${commitish}' ."]
        image = buildDockerImage(imageName, options)
    }

    stage('Publish Image') {
        publishDockerImage(image, 'PCIC_DOCKERHUB_CREDS')
    }

    // Only conduct security scan on branches filed as pull requests or if master
    if(BRANCH_NAME.contains('PR') || BRANCH_NAME == 'master') {
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
