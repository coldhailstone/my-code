export default function Detector() {
	this.detectItemsMap = new Map();
	this.changeStatusMap = new Map();
}

Detector.getInstance = function() {
	if (window.detector === undefined || window.detector === null)
		window.detector = new Detector();

	return window.detector;
}

Detector.prototype.setDetectItems = function(detectName, items) {
	this.detectItemsMap.set(detectName, !items || typeof items !== "object" ? items : this.recursiveDeepCopy(items));
	this.changeStatusMap.set(detectName, false);
}

Detector.prototype.recursiveDeepCopy = function(obj) {
	const clone = {};
	for (const [key, value] of Object.entries(obj)) {
		if (!value || typeof value !== "object")
			clone[key] = obj[key];
		else
			clone[key] = this.recursiveDeepCopy(value);
	}
	return clone;
}

Detector.prototype.setDetectStatus = function(detectName, changedItem) {
	if (!this.detectItemsMap.has(detectName))
		return console.error("detectItem does not exist");

	this.changeStatusMap.set(detectName, this.recursiveChangedDetect(this.detectItemsMap.get(detectName), changedItem));
}

Detector.prototype.recursiveChangedDetect = function(detectItem, changedItem) {
	let isChanged = false;
	if (!detectItem || typeof detectItem !== "object") {
		if (detectItem !== changedItem)
			isChanged = true;
	} else {
		isChanged = Object.entries(detectItem).some(([key, value]) => this.recursiveChangedDetect(value, changedItem[key]));
	}

	return isChanged;
}

Detector.prototype.setItemStatus = function(detectName, status) {
	if (!this.changeStatusMap.has(detectName))
		return console.error("detectItem does not exist");

	this.changeStatusMap.set(detectName, status);
}

Detector.prototype.hasDetectItems = function(detectName) {
	return this.detectItemsMap.has(detectName);
}

Detector.prototype.isChangedItem = function(detectName) {
	return this.changeStatusMap.get(detectName);
}
