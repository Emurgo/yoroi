class Alert {
    get title(){
        return driver.$('//android.widget.TextView[@resource-id="android:id/alertTitle"]');
    }

    get message() {
        return driver.$('//android.widget.TextView[@resource-id="android:id/message"]');
    }

    get okButton() {
        return driver.$('//android.widget.Button[@resource-id="android:id/button1"]');
    }
}

module.exports = new Alert();