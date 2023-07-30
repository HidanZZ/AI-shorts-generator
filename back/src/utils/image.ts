import puppeteer from "puppeteer-core";
import { executablePath } from "puppeteer-core";
import asyncShell from ".";

const checkChromiumInstallation = async () => {
	try {
		await asyncShell("chromium --version");
		return true;
	} catch (error) {
		console.error("Chromium is not installed.");
		return false;
	}
};

const installChromium = async () => {
	try {
		const stdout = await asyncShell("sudo apt install -y chromium-browser");
		console.log("Chromium installation stdout:", stdout);
	} catch (error) {
		console.error("Chromium installation failed.", error);
	}
};

export async function redditQuestionImage(text: any, outputPath: any) {
	const htmlCode = `
  <body class="Post">
  <style>
  
  @import url('https://fonts.cdnfonts.com/css/segoe-ui-4');
  * {
  font-family: 'Segoe UI', sans-serif;
  
  }
  body {
    margin: 0;
    padding: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  
    overflow: hidden;
    position: relative;
  }
  
  .blur-background {
    background: linear-gradient(
      to right,
      #3700b3,
      #03dac6
    ); /* Replace with your desired background colors */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: blur(250px); /* Adjust the blur amount as needed */
    z-index: 1;
  }
  
  .content {
    z-index: 1;
    padding: 10px 20px;
  //   border-radius: 20px;
  }
  </style>
    <div class="blur-background"></div>
    <article
      class="size-default m-redesign ctaExperiment content"
      id="t3_15b3kz3"
      style="width: 500px; background-color: white; "
    >
      <div class="Post__header-wrapper">
        <header class="PostHeader m-default m-redesign m-single">
          <div class="PostHeader__metadata-container">
            <div class="PostHeader__post-descriptor-line">
              <div class="PostHeader__post-descriptor-line-overflow">
                <span
                  ><span class="PostHeader__post-meta-container"
                    ><a
                      href="/user/callmevicious/"
                      class="PostHeader__author-link m-pur-header"
                      style="
                        color: black;
                        font-weight: 700;
                        text-decoration: none;
                        justify-content: center;
                        align-items: center;
                        display: flex;
                        width: max-content;
                        gap: 10px;
                        font-size: 20px;
                      "
                      ><img
                        alt="u/callmevicious avatar"
                        class="PostHeader__avatar"
                        src="https://www.redditstatic.com/mweb2x/img/snoovatars/snoovatar_16.png"
                        style="
                          background-color: rgb(234, 0, 39);
                          width: 50px;
                          border-radius: 50%;
                        "
                      />Anonymos</a
                    ></span
                  ></span
                >
              </div>
            </div>
            <div class="PostHeader__metadata"></div>
          </div>
          <h1 class="PostHeader__post-title-line">
            
            ${text}
          </h1>
        </header>
      </div>
      <footer
        class="PostFooter m-redesign m-single"
        style="margin-top: 20px"
      >
        <div
          class="PostFooter__vote-and-tools-wrapper"
          style="
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            height: 30px;
          "
        >
          <div style="display: flex; gap: 10px">
            <div
              class="VotingBox PostFooter__votingBox"
              style="
                display: flex;
                gap: 10px;
                border: 1px solid #00000020;
                border-radius: 20px;
                justify-content: center;
                align-items: center;
                padding: 2px 10px;
                color: #00000090;
                fill: #00000090;
              "
            >
              <svg
                class="VotingBox__svg"
                height="16"
                viewBox="0 0 16 16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="m8 .200001c.17143 0 .33468.073332.44854.201491l7.19996 8.103998c.157.17662.1956.42887.0988.64437-.0968.21551-.3111.35414-.5473.35414h-3.4v5.496c0 .3314-.2686.6-.6.6h-6.4c-.33137 0-.6-.2686-.6-.6v-5.496h-3.4c-.236249 0-.450507-.13863-.547314-.35414-.096807-.2155-.058141-.46775.09877-.64437l7.200004-8.103998c.11386-.128159.27711-.201491.44854-.201491zm-5.86433 8.103999h2.66433c.33137 0 .6.26863.6.6v5.496h5.2v-5.496c0-.33137.2686-.6.6-.6h2.6643l-5.8643-6.60063"
                  fill-rule="evenodd"
                ></path>
              </svg>
              <div class="VotingBox__score m-redesign m-large">
                7.1k
              </div>
  
              <svg
                class="VotingBox__svg"
                height="16"
                viewBox="0 0 16 16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M4.2 0.799997C4.2 0.468626 4.46863 0.199997 4.8 0.199997H11.2C11.5314 0.199997 11.8 0.468626 11.8 0.799997V6.304H15.2C15.4363 6.304 15.6506 6.44269 15.7474 6.65827C15.8441 6.87385 15.8054 7.12615 15.6483 7.30273L8.44835 15.3987C8.33449 15.5268 8.17133 15.6 8 15.6C7.82867 15.6 7.66551 15.5268 7.55165 15.3987L0.351652 7.30273C0.194618 7.12615 0.15585 6.87385 0.252626 6.65827C0.349402 6.44269 0.563698 6.304 0.8 6.304H4.2V0.799997ZM5.4 1.4V6.904C5.4 7.23537 5.13137 7.504 4.8 7.504H2.13654L8 14.0971L13.8635 7.504H11.2C10.8686 7.504 10.6 7.23537 10.6 6.904V1.4H5.4Z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </div>
            <div
              class="PostFooter__award-wrapper"
              style="
                display: flex;
                gap: 10px;
                border: 1px solid #00000020;
                border-radius: 20px;
                justify-content: center;
                align-items: center;
                padding: 2px 10px;
                color: #00000090;
                fill: #00000090;
              "
            >
              <div
                class="PostAwards Post__awards"
                style="
                  display: flex;
                  gap: 5px;
                  justify-content: center;
                  align-items: center;
                "
              >
                <span class="AwardingsBar__awardItem"></span>
                <img
                  class="AwardingsBar__awardIcon"
                  src="https://www.redditstatic.com/gold/awards/icon/gold_64.png"
                  width="16px"
                />
                <div class="AwardingsBar__awardsCount">1</div>
              </div>
            </div>
            <a
              href="/r/AskReddit/comments/15b3kz3/whats_the_stupidest_real_men_dont_youve_ever_heard/"
              class="PostFooter__hit-area PostFooter__comments-link"
              rel="nofollow"
              style="
                display: flex;
                gap: 10px;
                border: 1px solid #00000020;
                border-radius: 20px;
                justify-content: center;
                align-items: center;
                padding: 2px 10px;
  
                color: #00000090;
                fill: #00000090;
                text-decoration: none;
              "
              ><svg
                class="PostFooter__comments-icon-new"
                viewBox="0 0 16 16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M4.00001 0C2.99219 0 2.02564 0.400356 1.31301 1.11299C0.600368 1.82563 0.200012 2.79218 0.200012 3.8V8.6C0.200012 9.60782 0.600368 10.5744 1.31301 11.287C2.02564 11.9996 2.99219 12.4 4.00001 12.4H5.35149L7.5753 14.6238C7.57545 14.624 7.5756 14.6241 7.57575 14.6243C7.81006 14.8586 8.18996 14.8586 8.42428 14.6243L10.6485 12.4H12C13.0078 12.4 13.9744 11.9996 14.687 11.287C15.3997 10.5744 15.8 9.60782 15.8 8.6V3.8C15.8 2.79218 15.3997 1.82563 14.687 1.11299C13.9744 0.400356 13.0078 0 12 0H4.00001ZM8.00001 13.3515L9.97575 11.3757C10.0883 11.2632 10.2409 11.2 10.4 11.2H12C12.6896 11.2 13.3509 10.9261 13.8385 10.4385C14.3261 9.95088 14.6 9.28956 14.6 8.6V3.8C14.6 3.11044 14.3261 2.44912 13.8385 1.96152C13.3509 1.47393 12.6896 1.2 12 1.2H4.00001C3.31045 1.2 2.64913 1.47393 2.16153 1.96152C1.67394 2.44912 1.40001 3.11044 1.40001 3.8V8.6C1.40001 9.28956 1.67394 9.95088 2.16153 10.4385C2.64913 10.9261 3.31045 11.2 4.00001 11.2H5.60001C5.7657 11.2 5.91569 11.2672 6.02427 11.3757C6.02435 11.3758 6.02443 11.3759 6.02452 11.376L8.00001 13.3515Z"
                  fill="inherit"
                  fill-rule="evenodd"
                ></path>
              </svg>
              7.6k</a
            >
          </div>
          <span
            class="Intercourse smaller-margin PostFooter__share"
            style="
              display: flex;
              border: 1px solid #00000020;
              border-radius: 50%;
              justify-content: center;
              align-items: center;
              padding: 5px;
              color: #00000090;
              fill: #00000090;
              text-decoration: none;
            "
          >
            <svg
              class="Intercourse__icon v2"
              viewBox="0 0 16 16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.47298 1.17643C8.36435 1.06744 8.21406 1 8.04802 1C7.88694 1 7.74068 1.06348 7.6329 1.16679L7.62376 1.17574L4.42376 4.37574C4.18944 4.61005 4.18944 4.98995 4.42376 5.22426C4.65807 5.45858 5.03797 5.45858 5.27229 5.22426L7.44802 3.04853V10.4C7.44802 10.7314 7.71665 11 8.04802 11C8.3794 11 8.64802 10.7314 8.64802 10.4V3.04853L10.8238 5.22426C11.0581 5.45858 11.438 5.45858 11.6723 5.22426C11.9066 4.98995 11.9066 4.61005 11.6723 4.37574L8.47298 1.17643Z"
                fill="inherit"
              ></path>
              <path
                d="M3.04802 8C3.04802 7.66863 2.77939 7.4 2.44802 7.4C2.11665 7.4 1.84802 7.66863 1.84802 8V12.8C1.84802 13.3835 2.07981 13.9431 2.49239 14.3556C2.90497 14.7682 3.46455 15 4.04802 15H12.048C12.6315 15 13.1911 14.7682 13.6037 14.3556C14.0162 13.9431 14.248 13.3835 14.248 12.8V8C14.248 7.66863 13.9794 7.4 13.648 7.4C13.3167 7.4 13.048 7.66863 13.048 8V12.8C13.048 13.0652 12.9427 13.3196 12.7551 13.5071C12.5676 13.6946 12.3132 13.8 12.048 13.8H4.04802C3.78281 13.8 3.52845 13.6946 3.34092 13.5071C3.15338 13.3196 3.04802 13.0652 3.04802 12.8V8Z"
                fill="inherit"
              ></path>
            </svg>
          </span>
        </div>
        <div class="DropdownModalWrapper"></div>
      </footer>
    </article>
  
  </body>
  
  `;

	const browser = await puppeteer.launch({
		executablePath: executablePath("chrome"),
	});
	const page = await browser.newPage();
	await page.setContent(htmlCode);
	let elementSelector = "article";
	// Modify the viewport size if needed
	await page.setViewport({ width: 800, height: 600 });

	const elementHandle = await page.$(elementSelector);
	if (!elementHandle) {
		console.error(`Element with selector '${elementSelector}' not found.`);
		await browser.close();
		return;
	}

	const boundingBox = await elementHandle.boundingBox();
	if (!boundingBox) {
		console.error("Bounding box of the element is not available.");
		await browser.close();
		return;
	}

	let imageBuffer = await page.screenshot({
		path: outputPath,
		clip: boundingBox,
	});

	await browser.close();
	return imageBuffer.toString("base64");
}
