# WISE-PaaS - CodePipeline

## Concept

<br>

![ci-cd](files/ci-cd.png)

<br>

- The developer pushes the source code to the remote repository, such as GitLab.
- A pipeline can be triggered by a tag event.
- A pipeline can also be run manually on the WISE-PaaS CodePipeline.
- A **Build Pipeline** is run to build the source code and save the build package (.zip file) to the blob container.
- The app can be directly deployed by running the **Deploy Pipeline** on the source code.
- If the build package has been previously saved to the blob container, the **Deploy Pipeline** will download the package from the container first and then deploy the app.
- WISE-PaaS **CodePipeline** supports [Blue-Green Deployment](https://docs.cloudfoundry.org/devguide/deploy-apps/blue-green.html), so the staging app can wait for the QA team to finish the test successfully and switch to the production state.

<br>

## Build Pipeline

