@Library('pcic-pipeline-library')_


pipeline {
    agent any
    environment {
        def image_name = BASE_REGISTRY + 'climate-explorer-frontend'
        def image = ''
    }

    stage('Code Collection') {
        steps {
            codeCollection()
        }
    }

    stage('Node Test Suite') {
        steps {
            runNodeTestSuite('node', 'jenkins-test')
        }
    }

    stage('Build Image') {
        steps {
            script {
                image = buildDockerImage(image_name)
            }
        }
    }

    stage('Publish Image') {
        steps {
            publishDockerImage(image, 'PCIC_DOCKERHUB_CREDS')
        }
    }

    stage('Security Scan') {
        environment {
            def scan_name = image_name + ':' + tags[0]
        }
        when {
            expression {
                return BRANCH_NAME.contains('PR');
            }
        }
        steps {
            writeFile file: 'anchore_images', text: scan_name
            anchore name: 'anchore_images', engineRetries: '700'
        }
    }

    stage('Clean Local Image') {
        steps {
            removeDockerImage(image_name)
        }
    }

    stage('Clean Workspace') {
        steps {
            cleanWs()
        }
    }
}
