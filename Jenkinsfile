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
 * Check if the branch has been tagged.  If so, use the tag as well as `latest`.
 * If not, use the branch name as a tag.
 *
 * @return tags a list of the tags for the image
 */
def get_tags() {
    String tag = sh (script: 'git tag --contains', returnStdout: true).trim()

    def tags = []
    if(!tag.isEmpty()) {
        tags.add(tag)
        tags.add('latest')
    } else {
        tags.add(BRANCH_NAME)
    }

    return tags
}


/**
 * Push to built image with its tags to our docker hub registry
 *
 * @param image the pre-built image
 * @param tags a list of tags for the image
 */
def push_with_tags(image, tags) {
    withDockerServer([uri: PCIC_DOCKER]){
        docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
            tags.each { tag ->
                image.push(tag)
            }
        }
    }
}


/**
 * Given an image publish it to the PCIC docker registry
 *
 * @param image to publish
 */
def publish_image(image) {
    if(BRANCH_NAME == 'master') {
        tags = get_tags()
        push_with_tags(image, tags)
    } else {
        push_with_tags(image, BRANCH_NAME)
    }
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
    def image_name = BASE_REGISTRY + 'cef-test'
    def image

    stage('Build Image') {
        image = build_image(image_name)
    }

    stage('Publish Image') {
        publish_image(image)
    }

    stage('Security Scan') {
        writeFile file: 'anchore_images', text: image_name
        anchore name: 'anchore_images', engineRetries: '700'
    }

    stage('Clean Local Image') {
        clean_local_image(image_name)
    }

    stage('Clean Workspace') {
        cleanWs()
    }
}
