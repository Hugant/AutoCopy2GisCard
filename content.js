(function() {
	$(document).ready(function() {
		if(~window.location.href.indexOf("2gis.ru")) {
			this.onkeydown = function(e) {
				if (e.ctrlKey && e.keyCode == 67) {
					var card = {};
					copyCard(card, function() {
						chrome.extension.sendMessage({name: "setCard", value: card});
					});
				}
			}
		}
	});

	$("head title")[0].addEventListener("DOMSubtreeModified", function() {
		if (~this.text.indexOf("amoCRM: Сделка #XXXXXX")) {
			var $newCompanyForm = $("#new_company_form");

			$inputs = {
				number:	$($("#person_name")[0]),
				city: 	$($(".card-entity-form__fields textarea")[0]),
				name: 	$($newCompanyForm.find("#new_company_name")[0]),
				phones: [],
				emails: [],
				website:$($newCompanyForm.find(".text-input[type = url]")[0]),
				adress: $($newCompanyForm.find("textarea")[0])
			};

			chrome.extension.sendMessage({name: "getCard"}, function(req) {
				var card = req;

				$inputs.name.bind("click", function() {
					addInputs(card);

					$inputs.phones = $newCompanyForm.find(".control-phone__formatted").toArray();
					$inputs.emails = $newCompanyForm.find(".text-input[data-type = email]").toArray();

					fillPlaceholders($inputs, card);
					copyTextToClipboard(card.name);
					this.focus();
				});

				$inputs.city.bind("click", function() {
					copyTextToClipboard(card.city);
					this.focus();
				});

				$newCompanyForm.on("click", ".text-input", function() {
					if (this.placeholder != "undefined" && this.placeholder != "") {
						copyTextToClipboard(this.placeholder);
						this.focus();
					}
				});

				$inputs.number.bind("click", function() {
					copyTextToClipboard("№ " + card.number);
					this.focus();
				});

				$("#save_and_close_contacts_link").click(function() {
					chrome.extension.sendMessage({name: "increaseNumber"});
				});
			});
		}
	});

	function addInputs(card) {
		var $phonesInputs = $("#new_company_form .control-phone__formatted");
		var $emailsInputs = $("#new_company_form .text-input[data-type = email]");

		if ($phonesInputs.length < card.phones.length) {
			for (var i = $phonesInputs.length; i < card.phones.length; i++) {
				$phonesInputs = $("#new_company_form .control-phone__formatted");
				$phonesInputs[$phonesInputs.length - 1].value = "...";
				$($("#new_company_form .linked-form__multiple-container .linked-form__field-add-multiple .linked-form__field__value")[0]).click();
				$phonesInputs[$phonesInputs.length - 1].value = "";
			}
		}

		if ($emailsInputs.length < card.emails.length) {
			for (var i = $emailsInputs.length; i < card.emails.length; i++) {
				$emailsInputs = $("#new_company_form .text-input[data-type = email]");
				$emailsInputs[$emailsInputs.length - 1].value = "...";
				$($("#new_company_form .linked-form__multiple-container .linked-form__field-add-multiple .linked-form__field__value")[1]).click();
				$emailsInputs[$emailsInputs.length - 1].value = "";
			}
		}
	}

	function fillPlaceholders($inputs, card) {
		setPlaceholder($inputs.number, "№ " + card.number);
		setPlaceholder($inputs.name, card.name);
		setPlaceholder($inputs.city, card.city);

		for (var i = 0; i < $inputs.phones.length; i++) {
			setPlaceholder($($inputs.phones[i]), card.phones[i]);
		}

		for (var i = 0; i < $inputs.emails.length; i++) {
			setPlaceholder($($inputs.emails[i]), card.emails[i]);
		}

		setPlaceholder($inputs.website, card.website);
		setPlaceholder($inputs.adress, card.address);
	}

	function copyCard(card, onComplete) {
		const parser = new Parser();
		let counter = 0;

		let ready = function() {
			counter++;
			if (counter == 6) {
				onComplete();
			}
		}

		parser.getName(function(name) {
			card.name = name;
			ready();
		});

		parser.getCity(function(city) {
			card.city = city;
			ready();
		});

		parser.getPhones(function(phones) {
			card.phones = phones;
			ready();
		});

		parser.getEmails(function(emails) {
			card.emails = emails;
			ready();
		});

		parser.getWebsite(function(website) {
			card.website = website;
			ready();
		});

		parser.getAddress(function(address) {
			card.address = address;
			ready();
		});


	};

	function setPlaceholder($element, str) {
		$element[0].placeholder = str;
	}

	function Parser() {
		this.getName = function(onComplete) {
			let name = $(".cardHeader__headerNameText").text();
			onComplete(name);
		};

		this.getAddress = function(onComplete) {
			let address;

			if ($(".card__filials")[0] != null) {
				var html = $.ajax($(".card__filials .card__filialsLink")[0].href);

				html.done(function(d) {
					var $articles = $(d).find("article");

					address = $articles.length +
						($articles.length % 10 < 5 ? " филиала: " : " филиалов: ");

					for (let i = 0; i < $articles.length; i++) {
						if ($($articles[i]).find("._address")[0] == null) {
							address += $($articles[i])
								.find(".miniCard__headerTitleLink")[0].text
								.replace("&nbsp;", " ")
								.replace("<br>", " ") + "; ";
						} else {
							address += $($articles[i])
								.find(".miniCard__address")[0].innerHTML
								.replace("&nbsp;", " ")
								.replace("<br>", " ") + "; ";
						}

					}

					onComplete(address);
				});

				html.fail(function(e, g, f) {
					address = $(".card__addressLink")[0].text
						.replace("&nbsp;", " ").replace("<br>", " ");
					onComplete(address);
				});
			} else {
				address = $(".card__addressLink")[0].text
					.replace("&nbsp;", " ").replace("<br>", " ");
				onComplete(address);
			}
		};

		this.getCity = function(onComplete) {
			let city =
				$("title")[0].innerHTML
						.substring(	$("title")[0].innerHTML.lastIndexOf(",") + 2,
									$("title")[0].innerHTML.lastIndexOf("—") - 1);
			onComplete(city);
		};

		this.getPhones = function(onComplete) {
			let phones = [];

			for (let i = 1; i < $(".contact__phonesItemLinkNumber").toArray().length; i++) {
				phones.push($(".contact__phonesItemLinkNumber")
					.toArray()[i].innerHTML);
			}

			onComplete(phones);
		};

		this.getEmails = function(onComplete) {
			let emails = [];

			for (var i = 0; i < $(".contact__otherList .contact__linkText").toArray().length; i++) {
				if (~$(".contact__otherList .contact__linkText")[i].href.indexOf("mailto")) {
					emails.push($(".contact__otherList .contact__linkText")
						.toArray()[i].innerHTML);
				}
			}

			onComplete(emails);
		};

		this.getWebsite = function(onComplete) {
			let website = $($("._type_website .contact__linkText")[0]).text();
			onComplete(website);
		};
	}


	function copyTextToClipboard(text) {
	  var textArea = document.createElement("textarea");

	  textArea.style.position = 'fixed';
	  textArea.style.top = 0;
	  textArea.style.left = 0;

	  textArea.style.width = '2em';
	  textArea.style.height = '2em';

	  textArea.style.padding = 0;

	  textArea.style.border = 'none';
	  textArea.style.outline = 'none';
	  textArea.style.boxShadow = 'none';

	  textArea.style.background = 'transparent';


	  textArea.value = text;

	  document.body.appendChild(textArea);

	  textArea.select();

	  try {
		document.execCommand('copy');
	  } catch (err) {
		console.log('Oops, unable to copy');
	  }

	  document.body.removeChild(textArea);
	};
})()
