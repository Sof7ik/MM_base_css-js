function validateInputField(event, element = null)
{
    function setElementValid(element, invalidClassName = "invalid", validClassName = "valid")
    {
        element.classList.remove(invalidClassName);
        // element.classList.add(validClassName);
        return true;
    }

    function setElementInvalid(element, invalidClassName = "invalid", validClassName = "valid")
    {
        element.classList.add(invalidClassName);
        // element.classList.remove(validClassName);
        return false;
    }

    let input = element;

    // if called onInput
    if (!element)
    {
        input = event.currentTarget;
    }

    // get filed type: text, tel, email, checkbox, hidden
    const fieldType = input.type;
    const inputValue = input.value.trim();

    if (fieldType === "email")
    {
        // validate Email address
        if (inputValue.length)
        {
            const emailRegExp = new RegExp(`^([a-z0-9_-]+\\.)*[a-z0-9_-]+@[a-z0-9_-]+(\\.[a-z0-9_-]+)*\\.[a-z]{2,6}$`);

            if (emailRegExp.test(inputValue))
                return setElementValid(input);
            else
                return setElementInvalid(input);
        }
        else
        {
            // on form submit
            if (!event)
                return setElementInvalid(input);
            // on input
            else
            {
                setElementValid(input);
                return false;
            }
        }
    }
    else if (fieldType === "text" && (input.autocomplete === "name") || (input.name === "name"))
    {
        // validate user name
        if (inputValue.length)
        {
            if (inputValue.length >= 2)
            {
                const digitalRegExp = new RegExp(`[0-9]`);

                if (digitalRegExp.test(inputValue))
                {
                    return setElementInvalid(input);
                }
                return setElementValid(input);
            }
            else
            {
                // returns false
                return setElementInvalid(input);
            }
        }
        else
        {
            // on form submit
            if (!event)
                return setElementInvalid(input);
            // on input
            else
            {
                setElementValid(input);
                return false;
            }
        }
    }
    else if (fieldType === "tel")
    {
        // ATTENTION. Will work only with InputMask plugin with "_" filler

        // validate phone number
        if (inputValue.length)
        {
            if (!inputValue.includes("_"))
                return setElementValid(input);
            else
            {
                return setElementInvalid(input);
            }
        }
        else
        {
            // on form submit
            if (!event)
                return setElementInvalid(input);
            // on input
            else
            {
                setElementValid(input);
                return false;
            }
        }

    }
    else if (fieldType === "checkbox")
        return input.checked;
    else
        throw new Error(`Invalid field type: ${input.tagName.toLowerCase()} [type="${input.type}"]. Except it from validation fields`);
}

async function onFormSubmit(event)
{
    function showFinalModal(htmlText, iconSrc)
    {
        const totalWrapper = form.closest('.free-consult-form-success-wrapper');

        totalWrapper.querySelector(".success-text").innerHTML = htmlText;
        totalWrapper.querySelector(".success-icon").src = iconSrc;

        totalWrapper.querySelector(".success-wrapper").classList.add('showed');
    }

    let isReadySend = [];
    let totalIsReadySend = [];

    event.preventDefault();
    const form = event.currentTarget;

    const formInputs = form.querySelectorAll("input:not([type='hidden'])");

    formInputs.forEach((input, id)=> {
        const validationResult = validateInputField(null, input);

        isReadySend[id] = {
            input: input,
            validationResult: validationResult,
        };

        totalIsReadySend[id] = validationResult;
    })

    console.log("validation result", isReadySend);

    if (!totalIsReadySend.includes(false))
    {
        const formData = new FormData();

        const telephoneValue = form.querySelector("input[type='tel']").value.trim();
        const nameValue = form.querySelector("input[name='name'][autocomplete='name']").value.trim();
        const pageName = form.querySelector('input[name="page_name"]').value;

        formData.append("PHONE_NUMBER", telephoneValue);
        formData.append("CLIENT_NAME", nameValue);
        formData.append("PAGE_NAME", pageName);

        await fetch("/local/templates/inject/php/mm_vid-produktsii-form-handler.php", {
            method: "POST",
            body: formData,
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.status === 200)
                {
                    showFinalModal(data.message, "/upload/mm_upload/icons/form-check.svg");
                }
                else if (data.status === 500)
                {
                    showFinalModal(data.message, "/upload/mm_upload/icons/form-error.svg");
                }
                else
                {
                    console.error(`Error code ${data.status}. Error message: ${data.message}`);
                }
            }).catch(data => {
                console.log(data)
            })
    }
}

const telMask = new Inputmask("+7 (999) 999-99-99", {
    inputmode: "tel"
});
document.querySelectorAll('[type="tel"]').forEach(inputTel => telMask.mask(inputTel));

document.querySelectorAll("form").forEach(formElem => {
    formElem.querySelectorAll("input:not(input[type='hidden'])").forEach(inputElem => {
        inputElem.addEventListener('input', validateInputField);
    })
})