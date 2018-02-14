# Naivechain - 블록체인 실행 200줄 코드

### 개발 동기
모든 현재 구현된 블록체인들은 밀접하게 결합되어있고 개발자들이 해결하려고 하는 문제들(ex: 비트코인, 이더리움)들과 밀접하게 결합되게 됩니다.
그들의 생각을 소스코드로 이해하기는 어려운 일입니다. 이 프로젝트는 가능한 블록체인이 간결하고 단순하게 실행하기 위한 것입니다.
 
### 블록체인은 무엇인가?
[From Wikipedia](https://ko.wikipedia.org/wiki/%EB%B8%94%EB%A1%9D%EC%B2%B4%EC%9D%B8) : 블록체인은 조작 및 수정 작업으로부터 보호되는 블럭이라는 지속적으로 증가하는 기록저장소를 유지하는 분산 데이터베이스입니다.

### Naivechain의 주요개념!
체크하기 [this blog post](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54#.dttbm9afr5) 주요개념에 대해 상제한 정보를 보기
* 노드를 제어하는 HTTP 인터페이스
* 다른 노드들을 통신하기 위해 웹 소켓(P2P)를 사용
* P2P 통신의 매우매우매우매우 슈퍼 울트라 간단한 프로토콜
* 노드에 대아토거 유지가 되지 않음
* 작업 허가 또는 브레이크에 대한 보호 조치가 없음: 블록을 경쟁없이 블록에 추가할 수 있음

![alt tag](naivechain_blockchain.png)

![alt tag](naivechain_components.png)


### Naivecoin
블록체인에 대한 광범위한 자습서를 보시고 싶으면 이 프로젝트를 체크해주세요 [Naivecoin](https://lhartikk.github.io/). 이 코인의 네이브체인 기반이며 거래처, 지갑 같은 도구를 제공합니다.

### 빠른 시작
(연결된 노드 2개와 블록 1개를 설정)
```
npm install
HTTP_PORT=3001 P2P_PORT=6001 npm start
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start
curl -H "Content-type:application/json" --data '{"data" : "Some data to the first block"}' http://localhost:3001/mineBlock
```

### 도커를 이용하여 빠른 시작
(3개의 3노드를 설정하고 한 블록을 설정)
###
```sh
docker-compose up
curl -H "Content-type:application/json" --data '{"data" : "Some data to the first block"}' http://localhost:3001/mineBlock
```

### HTTP API
##### Get blockchain
```
curl http://localhost:3001/blocks
```
##### Create block
```
curl -H "Content-type:application/json" --data '{"data" : "Some data to the first block"}' http://localhost:3001/mineBlock
``` 
##### Add peer
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addPeer
```
#### Query connected peers
```
curl http://localhost:3001/peers
```
