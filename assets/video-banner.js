(function () {
	const playVideo = (card) => {
		const video = card.querySelector(".banner__media video");
		if (video) {
			const button = card.querySelector(".js-play-video");

			if (video.parentElement.classList.contains("autoplay")) {
				video.autoplay = true;
				if (button) {
					button.classList.add("active");
				}
			}

			if (video.autoplay && video.paused) {
				video.play();
			}

			if (!video.autoplay && button) {
				button.classList.remove("active");
			}

			if (video.parentElement.dataset.videoLoop === "false") {
				video.addEventListener("ended", () => {
					button.classList.remove("active");
				});
			}
		}

		const videoUrl = card.querySelector(".banner__media iframe");
		if (videoUrl) {
      const button = card.querySelector(".js-play-video");
      if (videoUrl.parentElement.classList.contains("autoplay")) {
        if (videoUrl.classList.contains("js-youtube")) {
          videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "playVideo" + '","args":""}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "mute" + '","args":""}', "*");
					} else {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "unMute" + '","args":""}', "*");
					}
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
        } else if (videoUrl.classList.contains("js-vimeo")) {
          videoUrl.contentWindow.postMessage('{"method":"play"}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":0}', "*");
					} else {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":1}', "*");
					}
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
				}
				if (button) {
          button.classList.add("active");
				}
			}

      if (videoUrl.parentElement.classList.contains("autoplay") && videoUrl.classList.contains("video-pause")) {
        if (videoUrl.classList.contains("js-youtube")) {
          videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "playVideo" + '","args":""}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "mute" + '","args":""}', "*");
					} else {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "unMute" + '","args":""}', "*");
					}
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
        } else if (videoUrl.classList.contains("js-vimeo")) {
          videoUrl.contentWindow.postMessage('{"method":"play"}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":0}', "*");
					} else {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":1}', "*");
					}
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
				}
			}

      if (!videoUrl.parentElement.classList.contains("autoplay") && button) {
        button.classList.remove("active");
		}
	}
	};

	const stopVideo = (card) => {
		const videoActive = card.querySelector(".banner__media video");
		if (videoActive) {
			videoActive.pause();
		}

		const videoUrlActive = card.querySelector(".banner__media iframe");
		if (videoUrlActive) {
      if (videoUrlActive.classList.contains("js-youtube")) {
        videoUrlActive.contentWindow.postMessage('{"event":"command","func":"' + "pauseVideo" + '","args":""}', "*");
        videoUrlActive.classList.add("video-pause");
        videoUrlActive.classList.remove("video-play");
      } else if (videoUrlActive.classList.contains("js-vimeo")) {
        videoUrlActive.contentWindow.postMessage('{"method":"pause"}', "*");
        videoUrlActive.classList.add("video-pause");
        videoUrlActive.classList.remove("video-play");
			}
		}
	};

	const controlsVideo = (section) => {
		const buttonsPlay = section.querySelectorAll(".js-play-video");
		const buttonsSound = section.querySelectorAll(".js-sound-video");

		buttonsPlay.forEach((button) => {
			button.addEventListener("click", (event) => onClickPlayPause(event));
			function onClickPlayPause(event) {
				const buttonPlay = event.currentTarget;
				const parentElement = buttonPlay.closest(".video-banner__content");
				if (buttonPlay.classList.contains("js-play-video")) {
					const video = parentElement.querySelector("video");
					if (video) {
						if (video.paused) {
							video.play();
						} else {
							video.pause();
						}
						buttonPlay.classList.toggle("active");
					}
				}

				const videoUrl = parentElement.querySelector("iframe");
				if (videoUrl) {
					if (videoUrl.classList.contains("video-pause")) {
						if (videoUrl.classList.contains("js-youtube")) {
							videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "playVideo" + '","args":""}', "*");
							if (videoUrl.classList.contains("video-muted")) {
								videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "mute" + '","args":""}', "*");
							} else {
								videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "unMute" + '","args":""}', "*");
							}
							videoUrl.classList.add("video-play");
							videoUrl.classList.remove("video-pause");
						} else if (videoUrl.classList.contains("js-vimeo")) {
							videoUrl.contentWindow.postMessage('{"method":"play"}', "*");
							if (videoUrl.classList.contains("video-muted")) {
								videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":0}', "*");
							} else {
								videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":1}', "*");
							}
							videoUrl.classList.add("video-play");
							videoUrl.classList.remove("video-pause");
						}
					} else {
						if (videoUrl.classList.contains("js-youtube")) {
							videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "pauseVideo" + '","args":""}', "*");
							videoUrl.classList.add("video-pause");
							videoUrl.classList.remove("video-play");
						} else if (videoUrl.classList.contains("js-vimeo")) {
							videoUrl.contentWindow.postMessage('{"method":"pause"}', "*");
							videoUrl.classList.add("video-pause");
							videoUrl.classList.remove("video-play");
						}
					}
					buttonPlay.classList.toggle("active");
				}
			}
		});

		buttonsSound.forEach((button) => {
			button.addEventListener("click", (event) => onClickSound(event));
			function onClickSound(event) {
				const buttonSound = event.currentTarget;
				const parentElement = buttonSound.closest(".video-banner__content");

				if (buttonSound.classList.contains("js-sound-video")) {
					const video = parentElement.querySelector("video");
					if (video) {
						if (video.muted) {
							setTimeout(() => {
								video.muted = false;
							}, 10);
						} else {
							setTimeout(() => {
								video.muted = true;
							}, 10);
						}
						buttonSound.classList.toggle("active");
					}
				}

				const videoUrl = parentElement.querySelector('iframe')
				if (videoUrl) {
					if (videoUrl.classList.contains('video-muted')) {
						if (videoUrl.classList.contains('js-youtube')) {
							videoUrl.contentWindow.postMessage(
								'{"event":"command","func":"' + 'unMute' + '","args":""}',
								'*'
							)
							videoUrl.classList.remove('video-muted')
						} else if (videoUrl.classList.contains('js-vimeo')) {
							videoUrl.contentWindow.postMessage(
								'{"method":"setVolume", "value":1}',
								'*'
							)
							videoUrl.classList.remove('video-muted')
						}
					} else {
						if (videoUrl.classList.contains('js-youtube')) {
							videoUrl.contentWindow.postMessage(
								'{"event":"command","func":"' + 'mute' + '","args":""}',
								'*'
							)
							videoUrl.classList.add('video-muted')
						} else if (videoUrl.classList.contains('js-vimeo')) {
							videoUrl.contentWindow.postMessage(
								'{"method":"setVolume", "value":0}',
								'*'
							)
							videoUrl.classList.add('video-muted')
						}
					}
					buttonSound.classList.toggle('active')
				}
			}
		});
	};

	const initSection = (section) => {
		if (section && section.classList.contains("video-banner-section")) {
			const sectionObserver = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					let videoBannerContent = entry.target.querySelectorAll(
						".video-banner__content"
					);

					if (entry.isIntersecting) {
						videoBannerContent.forEach((card) => playVideo(card));
					} else {
						videoBannerContent.forEach((card) => stopVideo(card));
					}
				});
			});

			sectionObserver.observe(section);
			controlsVideo(section);
		}
	};

	const initializeMediaEmbeds = (section) => {
		const generatedId = 'id' + Math.random().toString(16).slice(2); // Generate a unique ID for iframes when multiple sections contain the same iframe
		const youtubePlayers = {}; // Store multiple player instances
		const initializedSections = new Set(); // Keep track of initialized sections to prevent duplicate initialization

		if (
			!section ||
			!section.classList.contains('video-banner-section') ||
			initializedSections.has(section)
		)
			return // Exit if the section is invalid or already initialized

		initializedSections.add(section);

		function initializeYouTubePlayers() {
			section.querySelectorAll('iframe.js-youtube').forEach((iframe, index) => {
				const videoBannerContent = iframe.closest('.video-banner__content');
				if (!videoBannerContent) return;

				// Update video button positions for YouTube players
				videoBannerContent
					.querySelectorAll('.video-banner__controls')
					.forEach((controller) => (controller.style.marginTop = '3.5rem'));

				// Generate a unique player ID
				const originalId = iframe.dataset.id;
				const uniqueId = `${originalId}-${index}-${generatedId}`;
				iframe.id = uniqueId;

				const stopButton = videoBannerContent.querySelector('.button--play');

				// Create a new player instance for this iframe
				youtubePlayers[uniqueId] = new YT.Player(uniqueId, {
					events: {
						onStateChange: ({data}) => {
							stopButton?.classList.toggle(
								'active',
								data === YT.PlayerState.PLAYING
							)
						},
					},
				});

				// Ensure button controls only its own video
				stopButton?.addEventListener('click', () => {
					const player = youtubePlayers[uniqueId]; // Get correct player instance
					if (player?.getPlayerState) {
						const state = player.getPlayerState();
						state === YT.PlayerState.PLAYING
							? player.pauseVideo()
							: player.playVideo()
					}
				})
			})
		}

		// Load YouTube API if not already loaded
		if (!window.YT?.Player) {
			const scriptTag = document.createElement('script');
			scriptTag.src = 'https://www.youtube.com/iframe_api';
			scriptTag.defer = true;
			document.body.appendChild(scriptTag);

			// Ensure multiple sections are initialized properly
			const prevOnYouTubeIframeAPIReady =
				window.onYouTubeIframeAPIReady || (() => {});
			window.onYouTubeIframeAPIReady = () => {
				prevOnYouTubeIframeAPIReady(); // Call previous function if any
				initializedSections.forEach((sec) => initializeMediaEmbeds(sec)); // Initialize all stored sections
			}
		} else {
			initializeYouTubePlayers();
		}
	};

	initSection(document.currentScript.parentElement);
	initializeMediaEmbeds(document.currentScript.parentElement);

	document.addEventListener("shopify:section:load", function (section) {
		initSection(section.target);
		initializeMediaEmbeds(section.target);
	});
})();
