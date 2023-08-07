import React, { ChangeEvent, KeyboardEvent, useState, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { ChatContainer, Chat, ChatScroll, MyChatting, OtherChatting, Chatting, MessageInput } from "./ChatComponent.style";
import { useRecoilState } from "recoil";
import { recieveMsg, sendMsg } from "/src/recoil/MeetDub";

export interface ChatProps {
  connectionIdProps: string;
  nicknameProps: string;
  streamManagerProps: any;
  // messageReceived: () => void;
}

interface messageType {
  connectionId: string;
  nickname: string;
  message: string;
}

const ChatComponent = ({ chatProps }: { chatProps: ChatProps }) => {
  const [messageList, setMessageList] = useState<messageType[]>([]);
  const [message, setMessage] = useState("시작");
  const [connectionId, setConnectionId] = useState(chatProps.connectionIdProps);
  const [nickname, setNickname] = useState(chatProps.nicknameProps);
  const [streamManager, setStreamManager] = useState<any>(chatProps.streamManagerProps);
  
  const chatScroll = useRef<HTMLDivElement>(null);

  //send는 컴포넌트에서 보내는 이벤트
  //recieve는 chat으로 받는 이벤트
  const [send, setSend] = useRecoilState(sendMsg);
  const [recieve, setRecieve] = useRecoilState(recieveMsg);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handlePressKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  //파라미터로 명령어 넣고 명령어 없으면 기본 메세지 전송
  const sendMessage = (order?:string) => {
    let tmp = message;
    if(order !== undefined) tmp = order;
    console.log(chatProps);
    if (tmp) {
      let newMessage = tmp.replace(/ +(?= )/g, "");
      if (newMessage !== "" && newMessage !== " ") {
        const data = {
          message: newMessage,
          nickname: nickname,
          streamId: streamManager.stream.streamId,
        };
        streamManager.stream.session.signal({
          data: JSON.stringify(data),
          type: "chat",
        });
      }
    }
    setMessage("");
  };

  const scrollToBottom = () => {
    chatScroll.current?.scrollIntoView({ behavior: "instant" });
  };

  // const close = () => {
  //   chatProps.close(undefined);
  // };

  useEffect(()=>{
    sendMessage();
  },[])

  //명령어 전송
  useEffect(()=>{
    if(send=="open") {
      setSend("none");
      sendMessage("open");
    }
  }, [send])


  useEffect(() => {
    streamManager.stream.session.on("signal:chat", (event: any) => {
      const data = JSON.parse(event.data);
      let updatedMessageList = [...messageList];
      updatedMessageList.push({
        connectionId: connectionId,
        nickname: data.nickname,
        message: data.message,
      });
      const document = window.document;
      setTimeout(() => {
        const video = document.getElementById("video-" + data.streamId);
      }, 50);
      setMessageList(updatedMessageList);
      scrollToBottom();

    });
    //이부분에 조건문으로 명령어 감지하고 리코일 이벤트 추가
    if (messageList.length - 1 > 0 && messageList[messageList.length - 1].message === "open") {
      
      // alert(messageList[messageList.length - 1].message + "  check");
      console.log("setRecieve");
      setRecieve("open");

      messageList.pop();

    }

  }, [messageList, chatProps]);

  //채팅 부분 css 작업 미완료
  return (
    <ChatContainer>
      <Chat>
        <ChatScroll className="message-wrap">
          {messageList.map((data, i) => data.connectionId !== connectionId ? (
            <div key={i}>
              {/* <canvas id={"userImg-" + i}className="user-img" /> */}
              <MyChatting className="msg-detail">
                <div className="msg-info">
                  nickname : {data.nickname}
                </div>
                <Chatting className="msg-content">
                  {/* <span className="triangle" /> */}
                  message : {data.message}
                </Chatting>
              </MyChatting>
            </div>
          ) : <div key={i}>
            <OtherChatting className="msg-detail">
              <div className="msg-info">
                nickname : {data.nickname}
              </div>
              <Chatting className="msg-content">
                {/* <span className="triangle" /> */}
                message : {data.message}
              </Chatting>
            </OtherChatting>
          </div>
          )}
          <div ref={chatScroll}></div>
        </ChatScroll>

        <MessageInput id="messageInput">
          <input
            placeholder="Send a message"
            id="chatInput"
            value={message}
            onChange={handleChange}
            onKeyPress={handlePressKey}
          />
          <div title="Send message">
            <div id="sendButton" onClick={()=>{sendMessage}}>
              <div />
            </div>
          </div>
        </MessageInput>
      </Chat>
    </ChatContainer>
  );
};

export default ChatComponent;
