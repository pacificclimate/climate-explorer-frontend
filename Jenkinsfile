/**
 * Build a docker image given the name
 *
 * @param image_name the name of the image
 * @return image the built docker image
 */
def build_image(image_name) {
    def image
    withDockerServer([uri: PCIC_DOCKER]) {
        image = docker.build(image_name)
    }

    return image
}

/**
 * Get the original branch name.
 *
 * In the case where a branch has been filed as a PR the `BRANCH_NAME`
 * environment varible updates from `some-branch-name` to `PR-[pull request #]`.
 * To keep image tagging consistent on Docker Hub we want to use the original
 * name.
 *
 * @return name the name of the branch
 */
def get_branch_name() {
    String name
    if (BRANCH_NAME.contains('PR')) {
        name = CHANGE_BRANCH
    } else {
        name = BRANCH_NAME
    }

    return name
}


/**
 * If the master branch has been tagged we also add the `latest` tag.  Otherwise
 * we just use the branch name as the tag.
 *
 * @return tags a list of the tags for the image
 */
def get_tags() {
    String tag = sh (script: 'git tag --contains', returnStdout: true).trim()

    def tags = []
    if(BRANCH_NAME == 'master' && !tag.isEmpty()) {
        // It is possible for a commit to have multiple git tags. We want to
        // ensure we add all of them in.
        tags.addAll(tag.split('\n'))
        tags.add('latest')
    } else {
        String branch_name = get_branch_name()
        tags.add(branch_name)
    }

    return tags
}


/**
 * Given an image publish it with a tag to the PCIC docker registry.
 *
 * @param image to publish
 * @return tag to use later in the security scan
 */
def publish_image(image) {
    def tags = get_tags()

    withDockerServer([uri: PCIC_DOCKER]){
        docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
            tags.each { tag ->
                image.push(tag)
            }
        }
    }

    return tags
}


/**
 * Clean up image on dev01
 *
 * @param image_name name of the image to clean up
 */
def clean_local_image(image_name) {
    withDockerServer([uri: PCIC_DOCKER]){
        sh "docker rmi ${image_name}"
    }
}


node {
    stage('Code Collection') {
        checkout scm
        sh 'git fetch'
    }

    nodejs('node') {
        stage('Installation') {
            sh 'npm install'
        }

        stage('Test Suite') {
            sh 'npm run jenkins-test'
        }
    }

    // Define image items
    def image_name = BASE_REGISTRY + 'climate-explorer-frontend'
    def image
    def published_tags
    String scan_name

    stage('Build Image') {
        image = build_image(image_name)
    }

    stage('Publish Image') {
        published_tags = publish_image(image)
    }

    // Only conduct security scan on branches filed as pull requests
    if(BRANCH_NAME.contains('PR')) {
        stage('Security Scan') {
            // Use one of our published tags to identify the image to be scanned
            scan_name = image_name + ':' + published_tags[0]

            writeFile file: 'anchore_images', text: scan_name
            anchore name: 'anchore_images', engineRetries: '700'
        }
    }

    stage('Clean Local Image') {
        clean_local_image(image_name)
    }

    stage('Clean Workspace') {
        cleanWs()
    }
}
