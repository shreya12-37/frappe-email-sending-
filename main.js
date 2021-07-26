frappe.ui.form.on('Sales Invoice',{
        refresh(frm){
            frm.add_custom_button(__('Send Email'),function(frm){
                var name = cur_frm.doc.customer_name;
                // console.log(name);
                var emails = []
                var email_template_list_arr = [];
                var email_template_message = {};
                frappe.call({
                        method: 'frappe.client.get_list',
                        args: {
                            'doctype': 'Message Template',
                            'fields': ['*'],
                            'filters': {
                                "subject" : "Service Verification Acknowledgement"
                            }
                        },
                        async: false,
                        callback: function(r) {
                            if (r.message.length > 0) {
                                var email_template_list = r.message;
                                console.log("hiiiiii",email_template_list)
                                email_template_list_arr = Array.from(Object.keys(email_template_list), k => email_template_list[k].subject);
                                console.log("hiiiiii",email_template_list_arr)

                                email_template_message = email_template_list.reduce(function(obj, item) {
                                    obj[item.subject] = obj[item.subject] || [];
                                    obj[item.subject].push(item.response);
                                    return obj;
                                }, {});

                                console.log("grouped val", email_template_message["Service Verification Acknowledgement"])
                                //let email_html = r.message[0].response
                                let email_template_message_temp = email_template_message["Service Verification Acknowledgement"]
                                console.log("here i am",email_template_message_temp)
                                email_template_message = email_template_message_temp.replace("{{customer_name}}", name);
                                console.log("here i am",email_template_message_temp)
                            }
                        }
                    });
                frappe.call({
                    method: "frappe.client.get_value",
                    args: {
                        doctype: "Lead",
                        filters: {'title': name},
                        fieldname: ['email_id','secondary_email'],
                    },
                    async: false,
                    callback: function(res) {
                        emails.push(res.message.email_id)
                        emails.push(res.message.secondary_email)
                        // console.log(emails)
                        let d = new frappe.ui.Dialog({
                            title: __("Send Email"),
                            fields: [{
                                "fieldtype": "Select",
                                "label": "Choose Email",
                                "fieldname": "choose_email",
                                "options": emails,
                            },
                            {
                                "fieldtype": "Select",
                                "label": "Choose Email Template List",
                                "fieldname": "email_template_list",
                                "reqd": 1,
                                "options": email_template_list_arr
                            },

                            {
                                "fieldtype": "Data",
                                "label": "Subject",
                                "fieldname": "subject",
                                'default':"Service Verification Acknowledgement"
                            }, 
                    
                            {
                                "fieldtype": "HTML",
                                "label": "Email Content",
                                "fieldname": "email_message",
                                "default": ''
                            }, 
                            
                            {
                                "fieldtype": "Button",
                                "label": __("Send"),
                                "fieldname": "update"
                            }
                        ]
                        });
                        d.$wrapper.find('.modal-dialog').css("width", "750px");
                        d.$wrapper.find('.modal-dialog').css("modal", "true");
                        d.$wrapper.find('.modal-dialog').css("fluid", "true");
                        d.$wrapper.find('.modal-dialog').css("height", "auto");
                        d.$wrapper.find('.modal-dialog').css("resizable", "false");
                        d.show();
                        $(document).on('change', 'select[data-fieldname="email_template_list"]', function(e) {
                        $("[data-fieldname='subject']").prop('readonly', true);
                        $("[data-fieldname='email_message']").prop('readonly', true);
                        var choosed_email_template = $(this).val();
                        
                        $("[data-fieldname='subject']").val(choosed_email_template);
                        $("[data-fieldname='email_message']").html(email_template_message[choosed_email_template]);
                        //console.log("ine no", email_template_message)
                    });

                    }
                });
            })
        }
    })
