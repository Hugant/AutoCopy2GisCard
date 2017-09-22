(function() {
	$(document).ready(function() {
		if(~window.location.href.indexOf("2gis.ru")) {
			this.onkeydown = function(e) {
				if (e.ctrlKey && e.keyCode == 67) {
					var card = {};
					copyCard(card);
					chrome.extension.sendMessage({name: "setCard", value: card});
					console.log(card);
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


			}
		}
	}

	function setPlaceholder($element, str) {
		$element[0].placeholder = str;
	}

	function Parser() {
		this.getName = function() {
			return $(".cardHeader__headerNameText").text();
		};

		this.getAddress = function() {
			/*var addressTemp;

			if ($(".card__filials")[0] != null) {
				var html = $.ajax($(".card__filials .card__filialsLink")[0].href);

				html.done(function(d) {
					var $articles = $(d).find("article");

					addressTemp = $articles.length + ($articles.length % 10 < 5 ? " филиала: " : " филиалов: ");

					for (var i = 0; i < $articles.length; i++) {
						if ($($articles[i]).find("._address")[0] == null) {
							addressTemp += $($articles[i]).find(".miniCard__headerTitleLink")[0]
								.text.replace("&nbsp;", " ").replace("<br>", " ") + "; ";
						} else {
							addressTemp += $($articles[i]).find(".miniCard__address")[0]
								.innerHTML.replace("&nbsp;", " ").replace("<br>", " ") + "; ";
						}

					}

					return addressTemp;
				});

				html.fail(function(e, g, f) {
					addressTemp = $(".card__addressLink")[0].text.replace("&nbsp;", " ").replace("<br>", " ");
					return addressTemp;
				});
			} else {*/
				addressTemp = $(".card__addressLink")[0].text.replace("&nbsp;", " ").replace("<br>", " ");
				return addressTemp;
			// }
		};

		this.getCity = function() {
			return $("title")[0].innerHTML
						.substring(	$("title")[0].innerHTML.lastIndexOf(",") + 2,
									$("title")[0].innerHTML.lastIndexOf("—") - 1);
		};

		this.getPhones = function() {
			var phonesTemp = [];

			for (var i = 1; i < $(".contact__phonesItemLinkNumber").toArray().length; i++) {
				phonesTemp.push($(".contact__phonesItemLinkNumber").toArray()[i].innerHTML);
			}

			return phonesTemp;
		};

		this.getEmails = function() {
			var emailsTemp = [];

			for (var i = 0; i < $(".contact__otherList .contact__linkText").toArray().length; i++) {
				if (~$(".contact__otherList .contact__linkText")[i].href.indexOf("mailto")) {
					emailsTemp.push($(".contact__otherList .contact__linkText").toArray()[i].innerHTML);
				}
			}

			return emailsTemp;
		};

		this.getWebsite = function() {
			return $($("._type_website .contact__linkText")[0]).text();
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

	function copyCard(card) {
		var parser = new Parser();

		card.name = parser.getName();
		card.address = parser.getAddress();
		card.city = parser.getCity();
		card.phones = parser.getPhones();
		card.emails = parser.getEmails();
		card.website = parser.getWebsite();

	/*card = {
		name: $(".cardHeader__headerNameText").text(),
		adress: "",
		city: 	$("title")[0].innerHTML
				.substring(	$("title")[0].innerHTML.lastIndexOf(",") + 2,
							$("title")[0].innerHTML.lastIndexOf("—") - 1),
		phones: [],
		site: $($("._type_website .contact__linkText")[0]).text(),
		emails: []
	}

	var phonesTemp = [];
	var emailsTemp = [];

	for (var i = 1; i < $(".contact__phonesItemLinkNumber").toArray().length; i++) {
		phonesTemp.push($(".contact__phonesItemLinkNumber").toArray()[i].innerHTML);
	}
	card.phones = phonesTemp;

	for (var i = 0; i < $(".contact__otherList .contact__linkText").toArray().length; i++) {
		emailsTemp.push($(".contact__otherList .contact__linkText").toArray()[i].innerHTML);
	}
	card.emails = emailsTemp;

	// if ($(".card__filials")[0] != null) {
		// var html = $.ajax($(".card__filials .card__filialsLink")[0].href);

		// html.done(function(d) {
			// var $articles = $(d).find("article");

			// card.adress = $articles.length + ($articles.length % 10 < 5 ? " филиала: " : " филиалов: ");

			// for (var i = 0; i < $articles.length; i++) {
				// if ($($articles[i]).find("._address")[0] == null) {
					// card.adress += $($articles[i]).find(".miniCard__headerTitleLink")[0]
						// .text.replace("&nbsp;", " ").replace("<br>", " ") + "; ";
				// } else {
					// card.adress += $($articles[i]).find(".miniCard__address")[0]
						// .innerHTML.replace("&nbsp;", " ").replace("<br>", " ") + "; ";
				// }

			// }

			// console.log(card.adress);
			// chrome.extension.sendMessage({name: "setCard", value: card});
		// });

		// html.fail(function(e, g, f) {
			// console.log("fail to parse");
		// });
	// } else {
		card.adress = $(".card__addressLink")[0].text.replace("&nbsp;", " ").replace("<br>", " ");
		chrome.extension.sendMessage({name: "setCard", value: card});
	// }
*/

	};
})()



// var $newCompanyForm = $("#new_company_form");
// var card = {};
// var cardd = new Card();

// var $inputs = {
	// number:	$($("#person_name")[0]),
	// city: 	$($(".card-entity-form__fields textarea")[0]),
	// name: 	$($newCompanyForm.find("#new_company_name")[0]),
	// phones: [],
	// emails: [],
	// site: 	$($newCompanyForm.find(".text-input[type = url]")[0]),
	// adress: $($newCompanyForm.find("textarea")[0])
// };
