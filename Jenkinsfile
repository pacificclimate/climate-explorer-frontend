@Library('pcic-pipeline-library')_


node {
    stage('Code Collection') {
        codeCollection()
    }

    stage('Node Test Suite') {
        runNodeTestSuite('node', 'jenkins-test')
    }

    // Define image items
    def image_name = BASE_REGISTRY + 'climate-explorer-frontend'
    def image
    def tags

    stage('Build Image') {
        image = docker.build(image_name, '--pull .')
    }

    stage('Publish Image') {
        tags = getPublishingTags()
        publishDockerImage(image, tags, 'PCIC_DOCKERHUB_CREDS')
    }

    // Only conduct security scan on branches filed as pull requests
    if(BRANCH_NAME.contains('PR')) {
        stage('Security Scan') {
            // Use one of our published tags to identify the image to be scanned
            String scan_name = image_name + ':' + tags[0]

            writeFile file: 'anchore_images', text: scan_name
            anchore name: 'anchore_images', engineRetries: '700'
        }
    }

    stage('Clean Local Image') {
        removeDockerImage(image_name)
    }

    stage('Clean Workspace') {
        cleanWs()
    }
}
