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

    stage ('Build Image') {
        String image_name = 'climate-explorer-frontend'
        String branch_name = BRANCH_NAME.toLowerCase()

        // Update image name if we are not on the master branch
        if (branch_name != 'master') {
            image_name = image_name + '/' + branch_name
        }

        withDockerServer([uri: PCIC_DOCKER]) {
            def image = docker.build(image_name)
        }
    }
}
