node {
    stage('Code Collection') {
        checkout scm
    }

    nodejs('node') {
        stage('Installation') {
            sh 'npm install'
        }

        stage('Test Suite') {
            sh 'npm run jenkins-test'
        }
    }

    def image
    String name = BASE_REGISTRY + 'climate-explorer-frontend'

    // tag branch
    if (BRANCH_NAME == 'master') {
        // figure out how to tag
    } else {
        name = name + ':' + BRANCH_NAME + "_${BUILD_ID}"
    }

    stage('testing for payload string') {
        def payloadString = build.buildVariableResolver.resolve("payload")
        sh "${payloadString}"
        payloadObject = new groovy.json.JsonSlurper().parseText(payloadString)
        sh "${payloadObject}"
        name_test = payloadObject.pusher.name
        sh "${name_test}"
    }

    stage('Build and Publish Image') {
        withDockerServer([uri: PCIC_DOCKER]) {
            image = docker.build(name)

            docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
                image.push()
            }
        }
    }

    stage('Remove Local Image') {
        withDockerServer([uri: PCIC_DOCKER]){
            sh "docker rmi ${name}"
        }
    }

    stage('Security Scan') {
        writeFile file: 'anchore_images', text: name
        anchore name: 'anchore_images', engineRetries: '700'
    }
}
