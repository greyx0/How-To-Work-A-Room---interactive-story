window.homerJson = "projectData/homer.json";
window.project_uid = null;
window.project = null;
window.actor = null;
window.avatar = null;
window.Avataaars = Avataaars;

window.Homer = new HomerParser(window.homerJson, null, () => {
	homerDrawer.drawLanguages();
	homerDrawer.init();
});

window.homerDrawer = {
	placeholders: {
		title                   : $("header h1"),
		project_name            : $("#project-name"),
		project_content         : $("#project-content"),
		flowList                : $("#flows"),
		locales                 : $("#locale"),
		flow                    : $("#flow"),
		properties              : $("#properties"),
		flow_title              : $("#flow #cover h1"),
		project_title           : $("#flow #cover h2"),
		cover                   : $("#cover"),
		node_content            : $("#node-content"),
		theEnd                  : $("#the-end"),
		actor_avatar_placeholder: $("#actor-avatar"),
		actor_name_placeholder  : $("#actor-name"),
		text_placeholder        : $("#text"),
		choices_placeholder     : $("#choices"),
	},
	
	drawLanguages: () => {
		if (Homer._project._availableLocale.length > 1)
			Homer._project._availableLocale.forEach((locale) => {
				let locale_placeholder = $("<div>").addClass("button locale");
				locale_placeholder.html(locale._code);
				locale_placeholder.on("click", () => {
					homerDrawer.placeholders.locales.find(".selected").removeClass("selected");
					homerDrawer.selectLocale(locale._code);
					locale_placeholder.addClass("selected");
				});
				/**
				 * Select actual Project locale
				 */
				if (Homer._project._locale === locale._code)
					locale_placeholder.addClass("selected");
				homerDrawer.placeholders.locales.append(locale_placeholder);
			});
	},
	
	init: () => {
		homerDrawer.placeholders.project_name.html(Homer._project._name);
		homerDrawer.placeholders.project_name.addClass("selected");
		homerDrawer.placeholders.title.html(Homer._project._name);
		homerDrawer.placeholders.node_content.hide();
		
		homerDrawer.selectFlow(Homer._project._flows[0]._id);
	},
	
	selectFlow: (flowId) => {
		homerDrawer.placeholders.flow.show();
		homerDrawer.placeholders.flow.find("#cover").show();
		
		homerDrawer.placeholders.theEnd.hide();
		
		let flow = Homer.getFlow(flowId);
		Homer._globalVars = HomerParser.globalVariables;
		Homer._localVars = [];
		Homer.start(null, flow._name);
		homerDrawer.placeholders.project_title.html(Homer._project._name);
		homerDrawer.placeholders.flow_title.html(flow._name);
	},
	
	printActors: () => {
		$("#project-buttons").find(".selected").removeClass("selected");
		$("#project-actors").addClass("selected");
		homerDrawer.placeholders.project_content.empty();
		let title = "<h2>Actors</h2>";
		homerDrawer.placeholders.project_content.append(title);
		
		Homer._project._actors.forEach((actor) => {
			let actor_placeholder = $("<div>").addClass("list");
			actor_placeholder.html(actor._name);
			homerDrawer.placeholders.project_content.append(actor_placeholder);
		})
	},
	
	selectLocale: (locale) => {
		Homer._project._locale = locale;
		Homer._locale = locale;
	},
	
	start: () => {
		Homer.selectedNodes = [];
		homerDrawer.placeholders.cover.fadeOut(300, () => {
			homerDrawer.placeholders.node_content.fadeIn();
		});
		homerDrawer.drawNext();
	},
	
	drawNext: (elementId = null) => {
		let hasNext = Homer.nextNode(elementId);
		let flow = Homer.getSelectedFlow();
		let node = Homer.getNode();
		$("#flow-name").html(flow._name);
		if (!hasNext || node == null) {
			homerDrawer.DialogueDone();
			return;
		}
		let actor_avatar_placeholder = $("#actor-avatar");
		let actor_name_placeholder = $("#actor-name");
		let text_placeholder = $("#text");
		let choices_placeholder = $("#choices");
		
		window.actor = null;
		window.avatar = "";
		
		if (node != null) {
			window.actor = Homer.getNodeActor();
			if (window.actor != null && !window.actor._isNarrator)
				window.avatar = window.Avataaars.create(actor._avatar._options);
			let actorName = actor._name + (window.actor._isNarrator ? " (narrator)" : "");
			switch (node._type) {
				case NodeType.text:
					homerDrawer.placeholders.actor_avatar_placeholder.empty();
					homerDrawer.placeholders.actor_name_placeholder.empty();
					homerDrawer.placeholders.text_placeholder.empty();
					homerDrawer.placeholders.choices_placeholder.empty();
					homerDrawer.placeholders.actor_avatar_placeholder.html(avatar);
					homerDrawer.placeholders.actor_name_placeholder.html(actorName);
					homerDrawer.placeholders.text_placeholder.html(Homer.getParsedText());
					let next = $("<button>").addClass("main").html("Next");
					next.on("click", () => {
						homerDrawer.drawNext();
					});
					homerDrawer.placeholders.choices_placeholder.html(next);
					homerDrawer.placeholders.choices_placeholder.prepend("<br><br>");
					break;
				
				case NodeType.choices:
					homerDrawer.placeholders.actor_avatar_placeholder.empty();
					homerDrawer.placeholders.actor_name_placeholder.empty();
					homerDrawer.placeholders.text_placeholder.empty();
					homerDrawer.placeholders.choices_placeholder.empty();
					homerDrawer.placeholders.actor_name_placeholder.html(actorName);
					homerDrawer.placeholders.actor_avatar_placeholder.html(avatar);
					
					homerDrawer.placeholders.text_placeholder.html(Homer.getParsedText(node._header));
					
					let elements = Homer.getAvailableChoices();
					elements.forEach((element) => {
						let choiceText = Homer.getParsedText(element);
						let choiceButton = $("<button>").addClass("choice").html(choiceText);
						choiceButton.on("click", () => {
							homerDrawer.drawNext(element._id);
						});
						homerDrawer.placeholders.choices_placeholder.append(choiceButton);
					});
					break;
			}
		}
	},
	
	DialogueDone: () => {
		homerDrawer.placeholders.theEnd.show();
		setTimeout(() => {
			homerDrawer.placeholders.theEnd.hide();
			homerDrawer.init();
		}, 4000);
		console.debug("THE END")
	}
};
