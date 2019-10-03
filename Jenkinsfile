node {
    stage('Collecting Code') {
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
        String branch_name = BRANCH_NAME

        // If branch is under PR review we need to get the name from elsewhere
        if (branch_name.toLowerCase().contains('pr')) {
            branch_name = CHANGE_NAME
        }

        // Update image name if we are not on the master branch
        if (branch_name != 'master') {
            image_name = image_name + '/' + branch_name
        }

        withDockerServer([uri: PCIC_DOCKER]) {
            def image = docker.build(image_name)
        }
    }
}
