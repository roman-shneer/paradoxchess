function uk() { 
	if (typeof window.uk == 'undefined') {
		window.uk = 0;
	} else { 
		window.uk++;
	}
	return 'uk' + window.uk;
}


export {uk};