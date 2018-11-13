var socket = io('/web');


var App = new function () {

	this.init = function () {

        socket.on('dataTestEE', function(res){
            if( _.isEmpty(res) === true){
                $(".contentStats").html('<div class="alert alert-primary" role="alert">Nothing !</div>');
                return;
            }
            
            // console.log(res);
            let testEE = res;
            let htmlOut = "";

            _(testEE).each( (nodeCount) => {
                htmlOut += App.generateItemLogs(nodeCount) ;
            });

            $(".contentStats").html(htmlOut);
        });

    };

    this.generateItemLogs = function(node){
        var htmlTesting = "";
        let statusNode = "";

        _(node.testing).each( (testingCount) => {
            let statusTesting = "";

            if(testingCount.status === 1){
                statusTesting = `<span class="badge badge-pill badge-success">Success</span>`;
            }else if(testingCount.status === 2){
                statusTesting = `<span class="badge badge-pill badge-danger">Fail service</span>`;
            }else{
                statusTesting = `<span class="badge badge-pill badge-warning">Disconnect</span>`;
            }

            htmlTesting += `
            <li class="list-group-item">${testingCount.nameTest} ${statusTesting}<br> <small class="text-muted">${testingCount.currentResult} === ${testingCount.expectationResult}</small></li>
            `;
        });

        if(node.intervalStatus === 1){
            statusNode = `<span class="badge badge-pill badge-success">Running</span>`;
        }else if(node.intervalStatus === 2){
            statusNode = `<span class="badge badge-pill badge-danger">Restart service</span>`;
        }else{
            statusNode = `<span class="badge badge-pill badge-warning">Disconnect</span>`;
        }
        
        let html = `
        <div class="col-md-4"><div class="card mb-4 shadow-sm">
            <div class="card-body">
                <h5 class="card-title">${node.nodeId} ${statusNode} </h5>
                <p class="text-muted">Mail: ${node.email}</p>
                <hr>

                <div class="card">
                    <div class="card-header">
                        Services test
                    </div>
                    <ul class="list-group list-group-flush">
                        ${htmlTesting}
                    </ul>
                </div>

                <div class="d-flex justify-content-between align-items-center"><div class="btn-group"></div>
                    <small class="text-muted">Last time connect: ${node.date}</small>
                </div>
            
            </div>
        </div></div>
        `;

        return html;
    }
}