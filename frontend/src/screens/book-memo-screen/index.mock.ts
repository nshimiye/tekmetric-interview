import type { PublicUser } from "../../auth/AuthContext";

// Mock user for testing
export const mockUser: PublicUser = {
  id: "test-user-123",
  name: "Test User",
  email: "test@example.com",
};

export const targetBookId = "the-martian";
export const MOCK_LIBRARY = {
  [targetBookId]: {
    book: {
      id: targetBookId,
      title: "The Martian",
      description:
        "In the Young Readers Edition of The Martian: Classroom-appropriate language Discussion questions and activities Q&A with Andy Weir Six days ago, astronaut Mark Watney became one of the first people to walk on Mars. Now, he's sure he'll be the first person to die there. After a dust storm nearly kills him and forces his crew to evacuate while thinking him dead, Mark finds himself stranded and completely alone with no way to even signal Earth that he’s alive – and even if he could get word out, his supplies would be gone long before a rescue could arrive. Chances are, though, he won't have time to starve to death. Damaged machinery, the unforgiving environment, or plain old \"human error\" are much more likely to kill him first. But Mark isn't ready to give up yet. Drawing on his ingenuity, his engineering skills and a relentless, dogged refusal to quit, he steadfastly confronts one seemingly insurmountable obstacle after the next. Will his resourcefulness be enough to overcome the impossible odds against him?",
      authors: ["Andy Weir"],
      thumbnail:
        "http://books.google.com/books/content?id=1MXLDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      infoLink:
        "http://books.google.com/books?id=1MXLDwAAQBAJ&dq=the+martian&hl=&as_pt=BOOKS&source=gbs_api",
      publishedDate: "2020-01-30",
      source: "google-books",
    },
    memos: [],
  },
};
