module.exports = (functions, admin, exports) => {

	//listen for time updates, and count them
    var updateAccessCount = functions.database.ref('/{application}/apps/{type}/{device}/time')
        .onWrite(event => {
            
            event.data.ref.parent.child('count')
            .once('value', snapshot => {
                var current = snapshot.val() || 1
                    snapshot.ref.set(current + 1).then();
            }).then();
            
        });
    
    exports.updateAccessCount = updateAccessCount;

    return {};
};
